# Backend Architecture

**Framework:** Express 5
**Language:** TypeScript
**LLM:** Groq API (Llama 3.3 70B, OpenAI-compatible)
**GitHub:** Octokit REST client
**PDF:** pdf-parse library
**Deployed on:** Railway

## File Structure

```
backend/src/
├── index.ts                        → Server entry point (Express setup, middleware, routes)
│
├── routes/
│   ├── scan.ts                     → POST /scan, GET /scans, GET /scans/:id
│   └── chat.ts                     → POST /chat, GET /sessions, GET /messages
│
├── services/
│   ├── resumeService.ts            → PDF text extraction → LLM skill extraction
│   ├── linkedinService.ts          → PDF text extraction → LLM profile extraction
│   ├── githubService.ts            → GitHub API: repos, languages, files, code samples
│   ├── targetRoleService.ts        → LLM: identify required skills for a role
│   ├── evidenceService.ts          → Orchestrates all 5 scoring components per skill
│   ├── gapAnalysisService.ts       → LLM: projects, quick wins, readiness projection
│   ├── chatService.ts              → Chat message handling, session creation
│   └── historyService.ts           → Load chat messages from database
│
├── scoring/
│   ├── languagePresence.ts         → Component A: skill language in repos (0-25 pts)
│   ├── structuralEvidence.ts       → Component B: tests, CI/CD, Docker (0-20 pts)
│   ├── codeQualityScorer.ts        → Component C: LLM code review (0-20 pts)
│   ├── readmeScorer.ts             → Component D: LLM README evaluation (0-10 pts)
│   ├── linkedinCorroboration.ts    → Component E: endorsements, certs (0-25 pts)
│   ├── crossReference.ts           → 8-way status classification
│   └── overallScore.ts             → Weighted average across all skills
│
├── middleware/
│   ├── auth.ts                     → JWT verification via Supabase
│   └── upload.ts                   → Multer: PDF files, 5MB limit
│
├── utils/
│   ├── supabase.ts                 → Supabase admin client
│   ├── github.ts                   → Octokit instance
│   ├── llm.ts                      → Groq/OpenAI client
│   ├── sanitize.ts                 → Input validation (GitHub username, strings)
│   ├── parseLLMJSON.ts             → Robust JSON parsing from LLM responses
│   └── errors.ts                   → Custom error classes
│
└── config/
    ├── constants.ts                → Max repos, thresholds, model config
    └── prompts.ts                  → All LLM system prompts
```

## Key Patterns

- **Parallel extraction** using `Promise.allSettled()` — one failure doesn't block others
- **Batch LLM calls** — code quality and README quality scored once globally (not per-skill)
- **Robust JSON parsing** — 3-attempt strategy to handle LLM response formatting issues
- **Edge case notes** — backend detects empty repos, sparse resumes, invalid LinkedIn and adds warning notes
