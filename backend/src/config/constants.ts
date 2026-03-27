export const SCORE_WEIGHTS = {
  GITHUB_LANGUAGE: 25,
  GITHUB_STRUCTURE: 20,
  GITHUB_CODE_QUALITY: 20,
  GITHUB_README: 10,
  LINKEDIN_CORROBORATION: 25,
} as const;

export const SCORE_THRESHOLDS = {
  STRONG: 80,
  MODERATE: 55,
  WEAK: 30,
  VERY_WEAK: 1,
  NONE: 0,
} as const;

export const IMPORTANCE_WEIGHTS = {
  critical: 3,
  important: 2,
  nice_to_have: 1,
} as const;

export const MAX_REPOS_TO_ANALYZE = 10;
export const MAX_CODE_SAMPLES_PER_REPO = 3;
export const MAX_REPOS_FOR_CODE_REVIEW = 5;
export const MAX_FILE_SIZE_FOR_REVIEW = 50000; // 50KB — skip very large files

export const CLAUDE_MODEL = 'llama-3.3-70b-versatile';
export const CLAUDE_MAX_TOKENS = 4096;
