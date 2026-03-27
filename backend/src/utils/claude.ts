import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

let groqClient: OpenAI | null = null;

export const getLLM = (): OpenAI => {
  if (!groqClient) {
    if (!apiKey) {
      throw new Error('Missing GROQ_API_KEY environment variable');
    }
    groqClient = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return groqClient;
};

// Backward-compatible alias
export const getClaude = getLLM;
