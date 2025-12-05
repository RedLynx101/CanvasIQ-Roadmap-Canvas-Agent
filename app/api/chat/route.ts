import { NextRequest, NextResponse } from 'next/server';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { openai, MODEL } from '@/lib/openai';
import { buildSystemMessage } from '@/lib/prompts';
import { mathToolDefinition, evaluateMathExpression } from '@/lib/math-tool';

type CanvasMessage = Exclude<ChatCompletionMessageParam, { role: 'developer' }>;
type ToolCallState = { id: string; name: string; args: string; type: 'function' };
type ToolCallDelta = {
  index?: number;
  id?: string;
  function?: { name?: string; arguments?: string };
};
type CanvasToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

const encoder = new TextEncoder();

function safeParseToolArgs(raw?: string) {
  if (!raw) return { ok: true, args: {} as Record<string, unknown> };
  try {
    return { ok: true, args: JSON.parse(raw) as Record<string, unknown> };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Invalid tool arguments JSON.',
    };
  }
}

async function streamChatWithMathTools(
  messages: CanvasMessage[],
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  const conversation: CanvasMessage[] = [...messages];
  const maxToolIterations = 10;

  for (let i = 0; i < maxToolIterations; i++) {
    const toolCallState: Record<number, ToolCallState> = {};
    let streamHasContent = false;

    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: conversation as ChatCompletionMessageParam[],
      temperature: 0.7,
      max_completion_tokens: 10000,
      tools: [mathToolDefinition],
      tool_choice: 'auto',
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const choice = chunk.choices?.[0];
      const delta = (choice?.delta || {}) as Partial<CanvasMessage> & {
        tool_calls?: ToolCallDelta[];
      };

      // Stream content deltas directly to the client
      const contentDelta = (delta.content as string) || '';
      if (contentDelta) {
        streamHasContent = true;
        fullContent += contentDelta;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ content: contentDelta })}\n\n`
          )
        );
      }

      // Collect tool call deltas
      const deltaToolCalls = delta.tool_calls || [];
      deltaToolCalls.forEach(
        (tc: {
          index?: number;
          id?: string;
          function?: { name?: string; arguments?: string };
        }) => {
          const idx = tc.index ?? 0;
          if (!toolCallState[idx]) {
            toolCallState[idx] = {
              id: tc.id || '',
              name: tc.function?.name || '',
              args: '',
              type: 'function',
            };
          }

          if (tc.id) toolCallState[idx].id = tc.id;
          if (tc.function?.name) toolCallState[idx].name = tc.function.name;
          if (tc.function?.arguments) {
            toolCallState[idx].args += tc.function.arguments;
          }
        }
      );
    }

    const toolCalls: CanvasToolCall[] = Object.values(toolCallState).map(
      (tc) => ({
      id: tc.id,
      type: tc.type,
        function: { name: tc.name, arguments: tc.args || '' },
      })
    );

    if (toolCalls.length > 0) {
      // Persist assistant message that requested tool calls
      conversation.push({
        role: 'assistant',
        content: streamHasContent ? fullContent : null,
        tool_calls: toolCalls,
      });

      // Execute tool calls sequentially and append results
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function?.name ?? 'evaluate_math';
        let toolPayload: Record<string, unknown> = {};

        if (toolName === 'evaluate_math') {
          const parsed = safeParseToolArgs(toolCall.function?.arguments);
          if (!parsed.ok) {
            toolPayload = { error: `Invalid math tool args: ${parsed.error}` };
          } else {
            const args = parsed.args || {};
            const expression =
              typeof (args as Record<string, unknown>).expression === 'string'
                ? (args as { expression: string }).expression
                : '';

            if (!expression) {
              toolPayload = { error: 'No expression provided.' };
            } else {
              try {
                const evaluation = evaluateMathExpression(expression);
                toolPayload = {
                  ...evaluation,
                  source: 'math-tool',
                };
              } catch (toolError) {
                toolPayload = {
                  error:
                    toolError instanceof Error
                      ? toolError.message
                      : 'Unknown math tool error.',
                };
              }
            }
          }
        } else {
          toolPayload = {
            error: `Unsupported tool: ${toolName}`,
          };
        }

        conversation.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolPayload),
        });
      }

      // Continue the loop for another assistant turn
      continue;
    }

    // No tool calls; this is the final response
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
    return;
  }

  // Fallback: avoid throwing so the client connection can complete
  controller.enqueue(
    encoder.encode(
      `data: ${JSON.stringify({
        content:
          'I could not finish the response after multiple tool attempts. Please try again or simplify your request.',
      })}\n\n`
    )
  );
  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
  controller.close();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, phase, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Build the system message based on current phase
    const systemMessage = buildSystemMessage(phase || 'welcome', context || {});

    // Prepare messages for OpenAI
    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: 'system' as const, content: systemMessage },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Stream chat with math tool support
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          await streamChatWithMathTools(
            openaiMessages as CanvasMessage[],
            controller
          );
        } catch (streamError) {
          controller.error(streamError);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Check for API key issues
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

