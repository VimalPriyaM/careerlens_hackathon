import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.GITHUB_TOKEN;

// GitHub client — initialized lazily (not needed in Phase 0)
let octokitClient: Octokit | null = null;

export const getOctokit = (): Octokit => {
  if (!octokitClient) {
    octokitClient = new Octokit({
      auth: token || undefined, // Works without token (60 req/hr) but limited
    });
  }
  return octokitClient;
};
