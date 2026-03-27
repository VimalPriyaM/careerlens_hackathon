import OpenAI from 'openai';

let groqClient: OpenAI | null = null;

export const getLLM = (): OpenAI => {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
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

export const getClaude = getLLM;
