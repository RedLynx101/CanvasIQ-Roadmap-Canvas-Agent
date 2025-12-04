import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL } from '@/lib/openai';
import { USE_CASE_EXTRACTION_PROMPT } from '@/lib/prompts';

// API route for extracting structured data from user messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, extractionType } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    let systemPrompt = '';
    
    if (extractionType === 'use-case') {
      systemPrompt = USE_CASE_EXTRACTION_PROMPT;
    } else if (extractionType === 'company-context') {
      systemPrompt = `Extract company context from the user's message. Return a JSON object with:
{
  "companyName": "string",
  "industry": "string",
  "budgetConstraint": number (in dollars),
  "primaryGoals": ["string"],
  "existingInitiatives": ["string"]
}
Only include fields that are clearly mentioned. Use null for missing fields.`;
    } else {
      systemPrompt = 'Extract structured data from the user message. Return valid JSON.';
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content },
      ],
      temperature: 0.3,
      max_completion_tokens: 10000,
      response_format: { type: 'json_object' },
    });

    const extractedContent = completion.choices[0]?.message?.content;
    
    if (!extractedContent) {
      return NextResponse.json(
        { error: 'No content extracted' },
        { status: 500 }
      );
    }

    try {
      const parsed = JSON.parse(extractedContent);
      return NextResponse.json({ data: parsed });
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse extracted data', raw: extractedContent },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract data' },
      { status: 500 }
    );
  }
}

