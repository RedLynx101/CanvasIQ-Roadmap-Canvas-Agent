import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL } from '@/lib/openai';
import { buildSystemMessage } from '@/lib/prompts';

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
    const openaiMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
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

