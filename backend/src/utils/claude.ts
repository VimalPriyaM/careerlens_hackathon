import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;

let claudeClient: Anthropic | null = null;

export const getClaude = (): Anthropic => {
  if (!claudeClient) {
    if (!apiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable');
    }
    claudeClient = new Anthropic({ apiKey });
  }
  return claudeClient;
};
