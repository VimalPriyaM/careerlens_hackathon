# Scan Pipeline Data Flow

## Overview

When a user submits a scan, the system processes their Resume, LinkedIn, and GitHub data to produce evidence-backed skill scores. The entire pipeline takes 30-60 seconds.

## Step-by-Step Flow

### Phase 1: Input Validation
- Check resume PDF exists and is < 5MB
- Check LinkedIn PDF exists and is < 5MB
- Validate GitHub username (alphanumeric + hyphens, max 39 chars)
- Validate target role is non-empty

### Phase 2: Parallel Extraction (all run simultaneously)

**Resume Parser:**
```
PDF buffer → pdf-parse → raw text → LLM extraction → {skills, experience, projects, education}
```

**LinkedIn Parser:**
```
PDF buffer → pdf-parse → raw text → LLM extraction → {skills, endorsements, experience, certs}
```

**GitHub Analyzer:**
```
Username → Octokit API → profile + top 10 repos → per repo: languages, file tree, README, code samples
```

**Target Role Analyzer:**
```
Role title → LLM → required skills with importance (critical/important/nice_to_have) and category
```

**PDF Uploads** (in parallel with above):
```
Resume PDF → Supabase Storage: {user_id}/{scan_id}_resume.pdf
LinkedIn PDF → Supabase Storage: {user_id}/{scan_id}_linkedin.pdf
```

If any extraction fails → return 502 with error details. Pipeline stops.

### Phase 3: Evidence Scoring (sequential)

**Pre-compute (once, in parallel):**
- Code quality: batch up to 4 code samples → LLM rates 1-5 on 5 dimensions → normalize to 0-20
- README quality: batch up to 3 READMEs → LLM rates 1-5 on 5 dimensions → normalize to 0-10

**Per skill (loop through each target skill):**

| Component | Points | How it works |
|-----------|--------|-------------|
| A. Language Presence | 0-25 | Map skill to languages → count repos with those languages |
| B. Structural Evidence | 0-20 | Check for tests, CI/CD, Docker, proper structure in matching repos |
| C. Code Quality | 0-20 | Use pre-computed batch score (only if skill has matching repos) |
| D. README Quality | 0-10 | Use pre-computed batch score (only if skill has matching repos) |
| E. LinkedIn Corroboration | 0-25 | Check skill listed, endorsements, experience mentions, certs |

**Total = A + B + C + D + E** (capped at 100)

**Cross-reference classification:**
- Check: is skill on resume? on LinkedIn? on GitHub (score >= 15)?
- Classify into one of 8 statuses (Fully Verified → Missing)

### Phase 4: Gap Analysis (LLM)

Input: all evidence scores, target skills, conflicts, hidden skills

Output:
- Project recommendations (title, tech stack, checklist, estimated impact)
- Quick wins (low-effort actions)
- Current readiness percentage
- Projected readiness after completing projects
- Gap summary text

### Phase 5: Store & Return

- Insert complete scan record into Supabase `scans` table
- Return full result JSON to frontend

## Edge Case Notes

The backend detects and adds warning notes for:
- Zero public GitHub repos → "Evidence scores rely on resume and LinkedIn only"
- Very few resume skills (1-2) → "Resume appears thin"
- Empty LinkedIn data → "This may not be a valid LinkedIn PDF export"
