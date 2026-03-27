import { Octokit } from '@octokit/rest';

let octokitClient: Octokit | null = null;

export const getOctokit = (): Octokit => {
  if (!octokitClient) {
    octokitClient = new Octokit({
      auth: process.env.GITHUB_TOKEN || undefined,
    });
  }
  return octokitClient;
};
