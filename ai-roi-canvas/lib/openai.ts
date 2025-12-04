import OpenAI from 'openai';

// Initialize OpenAI client
// The API key should be set via OPENAI_API_KEY environment variable
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL = 'gpt-4.1'; // Using gpt-4.1 as specified

