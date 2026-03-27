/**
 * Safe JSON parsing for LLM responses.
 * Handles common issues: markdown backticks, extra text around JSON.
 */

export function parseLLMJSON<T = any>(raw: string, context?: string): T {
  const label = context ? ` (${context})` : '';

  // Attempt 1: parse as-is
  try {
    return JSON.parse(raw);
  } catch (_) {
    // continue
  }

  // Attempt 2: strip markdown backticks (```json ... ``` or ``` ... ```)
  try {
    const stripped = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(stripped);
  } catch (_) {
    // continue
  }

  // Attempt 3: extract JSON between first { and last } (or [ and ])
  try {
    const firstBrace = raw.indexOf('{');
    const firstBracket = raw.indexOf('[');
    let start: number;
    let end: number;

    if (firstBrace === -1 && firstBracket === -1) {
      throw new Error('No JSON structure found');
    }

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      start = firstBracket;
      end = raw.lastIndexOf(']');
    } else {
      start = firstBrace;
      end = raw.lastIndexOf('}');
    }

    if (end <= start) {
      throw new Error('Malformed JSON structure');
    }

    const extracted = raw.slice(start, end + 1);
    return JSON.parse(extracted);
  } catch (_) {
    // continue
  }

  // All attempts failed
  console.error(`Failed to parse LLM JSON${label}:`, raw.slice(0, 500));
  throw new Error(
    `Failed to parse AI response${label}. Please try again.`
  );
}
