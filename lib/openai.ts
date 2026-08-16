import OpenAI from 'openai';

// Instantiate lazily so builds and non-AI routes do not require runtime secrets.
// The API routes still fail closed when OPENAI_API_KEY is absent.
export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured.');
  }

  return new OpenAI({ apiKey });
}

export const MODEL = 'gpt-5.1'; // Using gpt-5.1 as specified

