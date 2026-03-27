/**
 * Input sanitization utilities for CareerLens backend routes.
 */

/**
 * Trims whitespace and enforces a maximum length on a string input.
 * Returns empty string for non-string inputs.
 */
export function sanitizeString(input: unknown, maxLength: number): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

/**
 * Validates a GitHub username.
 * Rules: max 39 characters, alphanumeric and hyphens only, no leading/trailing hyphens.
 * Returns { valid, cleaned } where cleaned is the trimmed username.
 */
export function validateGithubUsername(username: unknown): { valid: boolean; cleaned: string; error?: string } {
  if (typeof username !== 'string' || username.trim().length === 0) {
    return { valid: false, cleaned: '', error: 'GitHub username is required.' };
  }

  const cleaned = username.trim();

  if (cleaned.length > 39) {
    return { valid: false, cleaned, error: 'GitHub username must be 39 characters or fewer.' };
  }

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(cleaned)) {
    return {
      valid: false,
      cleaned,
      error: 'GitHub username must contain only alphanumeric characters and hyphens, and cannot start or end with a hyphen.',
    };
  }

  return { valid: true, cleaned };
}
