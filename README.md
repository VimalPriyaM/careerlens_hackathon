# CareerLens AI

> **Prove It or Build It.**

CareerLens cross-references your **Resume**, **LinkedIn**, and **GitHub** against a target job role. It produces honest, evidence-backed skill scores — not self-reported claims — and generates a project roadmap to close the gaps.

**Live Demo:** [careerlens-hackathon.vercel.app](https://careerlens-hackathon.vercel.app)

---

## What Makes It Different

Job portals trust what you write. CareerLens doesn't. It checks three sources independently:

- **Resume** — what you claim
- **LinkedIn** — what your network validates
- **GitHub** — what your code proves

For every skill, it assigns one of **8 statuses**: from **"Fully Verified"** (all 3 sources agree) to **"Suspicious Claim"** (resume only, zero evidence elsewhere).

### The 8 Cross-Reference Statuses

| Status | Meaning |
|--------|---------|
| Fully Verified | All 3 sources confirm the skill |
| Claimed, Unproven | Resume + LinkedIn, but no GitHub code |
| Underreported | Resume + GitHub, but missing from LinkedIn |
| Hidden Skill | Found on GitHub/LinkedIn, missing from resume |
| Suspicious | Resume only — no external evidence |
| Undiscovered | GitHub only — you have it but don't know it |
| Social Only | LinkedIn only — weak signal |
| Missing | Not found on any source |

---

## Key Features

1. **Three-Source Evidence Matrix** — skill-by-skill grid showing Resume/LinkedIn/GitHub evidence with composite scores (0-100)
2. **5-Component Scoring Engine** — each skill scored across: Language Presence (25), Structural Evidence (20), Code Quality (20), README Quality (10), LinkedIn Corroboration (25)
3. **Conflict Detection** — flags skills claimed on resume but absent from code and social proof
4. **Hidden Skill Discovery** — finds skills proven by your code that you forgot to put on your resume
5. **Project Roadmap** — specific projects to build (not courses to take) that create evidence for missing skills, with GitHub push checklists
6. **Quick Wins** — low-effort actions for immediate score improvement
7. **AI Co-pilot** — personalized career chat that references your actual scores, gaps, and evidence
8. **PDF Export** — download your full analysis as a PDF
9. **Scan History & Deltas** — track progress across multiple scans with score comparisons
10. **Edge Case Handling** — graceful handling of empty GitHub profiles, sparse resumes, invalid LinkedIn PDFs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Zustand |
| **UI Components** | @base-ui/react, class-variance-authority, Lucide icons |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | Supabase (PostgreSQL + Auth + Row Level Security + Storage) |
| **LLM** | Groq API (Llama 3.3 70B) for skill extraction, code review, gap analysis |
| **APIs** | GitHub REST API (Octokit) |
| **PDF Processing** | pdf-parse (extraction), html2canvas + jsPDF (export) |
| **Deployment** | Vercel (frontend), Railway/Render (backend) |

---

## Architecture

```
User uploads Resume PDF + LinkedIn PDF + GitHub username + Target Role
                              |
                    +---------+---------+
                    |                   |
              Frontend (Next.js)   Backend (Express)
              - Auth (Supabase)    - PDF parsing
              - Dashboard UI       - GitHub analysis
              - Charts/Matrix      - LLM scoring
              - PDF export         - Evidence engine
                    |                   |
                    +---------+---------+
                              |
                        Supabase
                    - PostgreSQL (scans, chats)
                    - Auth (email, Google OAuth)
                    - Storage (PDF files)
                    - Row Level Security
```

### Scan Pipeline

All extraction pipelines run **in parallel** via `Promise.allSettled()`:

1. **Resume Parsing** — PDF text extraction + LLM skill extraction
2. **LinkedIn Parsing** — PDF text extraction + LLM profile extraction
3. **GitHub Analysis** — Profile + top 10 repos + languages + file trees + code samples
4. **Target Role Analysis** — LLM identifies required skills with importance levels

Then **sequential scoring**:

5. **Evidence Scoring** — 5-component scoring per skill (batch LLM calls for code quality + README quality)
6. **Cross-Reference Classification** — 8-way status per skill based on source presence
7. **Gap Analysis** — LLM generates project recommendations, quick wins, readiness projection

---

## Project Structure

```
careerlens/
  frontend/                   # Next.js 14 App
    src/
      app/
        dashboard/            # Main dashboard, scan, history, chat pages
        auth/callback/        # Supabase auth callback
        login/ & signup/      # Auth pages
      components/
        dashboard/            # Dashboard components (KPICards, EvidenceMatrix, etc.)
        ui/                   # Base UI components (sidebar, card, button, etc.)
      lib/                    # Supabase clients, API wrapper, analytics utils
      store/                  # Zustand store
      types/                  # TypeScript interfaces
  backend/                    # Express API
    src/
      routes/                 # scan.ts, chat.ts
      services/               # githubService, resumeService, linkedinService, etc.
      scoring/                # languagePresence, structuralEvidence, codeQuality, etc.
      middleware/              # auth, upload
      utils/                  # supabase, sanitize, parseLLMJSON
      config/                 # constants, prompts
  supabase-setup.sql          # Complete database schema
  requirements.txt            # Project requirements overview
```

---

## Setup

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Supabase** account ([supabase.com](https://supabase.com))
- **Groq** API key ([console.groq.com](https://console.groq.com))
- **GitHub** Personal Access Token ([github.com/settings/tokens](https://github.com/settings/tokens)) — increases rate limit from 60 to 5,000 req/hr

### 1. Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **SQL Editor** > **New Query**
3. Paste the contents of [`supabase-setup.sql`](./supabase-setup.sql) and run it
4. Go to **Authentication** > **URL Configuration**:
   - Set **Site URL** to your frontend URL (e.g., `http://localhost:3000`)
   - Add redirect URLs: `http://localhost:3000/auth/callback`
5. Go to **Storage** and verify the `user-documents` bucket was created

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your actual values in .env
npm install
npm run dev
```

The backend runs on `http://localhost:3001`.

**Environment Variables** (see `backend/.env.example`):

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `FRONTEND_URL` | Frontend origin for CORS |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Settings > API) |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret (Settings > API) |
| `GROQ_API_KEY` | Groq API key for LLM calls |
| `GITHUB_TOKEN` | GitHub PAT for API rate limits |

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Fill in your actual values in .env.local
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

**Environment Variables** (see `frontend/.env.example`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Your frontend URL (for auth redirects) |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:3001/api`) |

---

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import repo on [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables in Vercel project settings
5. Deploy

### Backend (Railway / Render)

1. Create new project on [Railway](https://railway.app) or [Render](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables
6. Update `NEXT_PUBLIC_API_URL` in Vercel to point to the deployed backend URL

### Post-Deployment

- Update **Supabase Site URL** to your production frontend URL
- Add production callback URL to Supabase redirect URLs: `https://your-app.vercel.app/auth/callback`
- Update `FRONTEND_URL` in backend env to production frontend URL

---

## Scoring System

Each skill is scored out of **100 points** across 5 components:

| Component | Max Points | Source | Method |
|-----------|-----------|--------|--------|
| **A. Language Presence** | 25 | GitHub | Checks if skill's languages exist across repos |
| **B. Structural Evidence** | 20 | GitHub | Detects tests, CI/CD, Docker, project structure |
| **C. Code Quality** | 20 | GitHub | LLM reviews code samples for quality signals |
| **D. README Quality** | 10 | GitHub | LLM evaluates README completeness |
| **E. LinkedIn Corroboration** | 25 | LinkedIn | Skills listed, endorsements, experience mentions, certs |

**Thresholds:**
- **Strong**: score >= 60 (green)
- **Moderate**: score 35-59 (amber)
- **Weak**: score < 35 (red)
- **Verified**: score >= 55

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Zero public GitHub repos | GitHub components score 0; LinkedIn still scores; warning note displayed |
| Very sparse resume (1-2 skills) | Matrix renders with mostly "missing" rows; note about thin resume |
| Non-LinkedIn PDF uploaded | LLM returns sparse data; LinkedIn scores 0; warning displayed |
| Long chat conversations (20+ msgs) | Only last 20 messages sent to LLM for context |
| Scan takes > 60 seconds | Progressive timeout messages shown to user |
| Same role scanned twice | New scan row created; history shows both with score deltas |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scan` | Run a full scan (multipart: resume, linkedin, github_username, target_role) |
| `GET` | `/api/scans` | List user's scans (paginated) |
| `GET` | `/api/scans/:id` | Get full scan details |
| `POST` | `/api/chat` | Send chat message (with optional scan context) |
| `GET` | `/api/chat/sessions` | List chat sessions |
| `GET` | `/api/chat/sessions/:id/messages` | Get session messages |
| `POST` | `/api/generate-bullet` | Generate resume bullet from project description |
| `POST` | `/api/auth/verify` | Verify auth token |
| `GET` | `/api/health` | Health check |

---

## License

MIT
