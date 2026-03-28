# Evidence Matrix

The core feature of CareerLens. For every skill the target role requires, it checks three independent sources and assigns a score.

## Three Sources

| Source | What it checks | How |
|--------|---------------|-----|
| **Resume** | Skill claimed | PDF → text extraction → LLM skill detection |
| **LinkedIn** | Skill validated by network | PDF → text extraction → LLM profile parsing |
| **GitHub** | Skill proven by code | API → repos, languages, files, code samples |

## 5-Component Scoring (0-100 per skill)

| Component | Max | What it measures |
|-----------|-----|-----------------|
| A. Language Presence | 25 | Does the skill's language exist in GitHub repos? How many repos? |
| B. Structural Evidence | 20 | Tests, CI/CD, Docker, proper project structure in repos |
| C. Code Quality | 20 | LLM reviews actual code: naming, error handling, patterns |
| D. README Quality | 10 | LLM checks README: purpose, setup instructions, tech stack |
| E. LinkedIn Corroboration | 25 | Skill listed, endorsement count, experience mentions, certs |

## 8 Cross-Reference Statuses

| Status | Resume | LinkedIn | GitHub | What it means |
|--------|--------|----------|--------|--------------|
| Fully Verified | Yes | Yes | Yes | Strong — all sources agree |
| Claimed, Unproven | Yes | Yes | No | No code evidence |
| Underreported | Yes | No | Yes | Missing from LinkedIn |
| Hidden Skill | No | Yes | Yes | Missing from resume — add it! |
| Suspicious | Yes | No | No | Resume-only claim — high risk |
| Undiscovered | No | No | Yes | You have it but don't know it |
| Social Only | No | Yes | No | Weak signal |
| Missing | No | No | No | No evidence anywhere |

## Dashboard Display

- Interactive table with expandable rows
- Click a skill to see the 5-component score breakdown
- Sticky skill name column on mobile (always visible when scrolling)
- Color-coded scores: green (60+), amber (35-59), red (<35)
- Source icons show found/not-found per source
