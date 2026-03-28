# External APIs Used

## 1. GitHub REST API

**Library:** `@octokit/rest`
**Auth:** Personal Access Token (increases rate limit from 60 to 5,000 req/hr)

**Endpoints used:**

| Endpoint | Purpose |
|----------|---------|
| `GET /users/{username}` | Fetch user profile (name, bio, repo count) |
| `GET /users/{username}/repos` | List repos (sorted by updated, owner only) |
| `GET /repos/{owner}/{repo}/languages` | Get language breakdown per repo |
| `GET /repos/{owner}/{repo}/contents/{path}` | Fetch file tree and file contents |
| `GET /repos/{owner}/{repo}/readme` | Fetch README content |

**Data collected per user:**
- Profile metadata (name, bio, follower count)
- Top 10 repos (filtered: non-empty, owner-only)
- Per repo: languages, root file tree, README, up to 3 code samples
- Aggregate language stats across all repos

---

## 2. Groq API (LLM)

**Library:** `openai` (Groq is OpenAI-compatible)
**Model:** `llama-3.3-70b-versatile`
**Max tokens:** 4096

**Used for:**

| Task | Input | Output |
|------|-------|--------|
| Resume extraction | Raw PDF text | Skills, experience, projects, education |
| LinkedIn extraction | Raw PDF text | Skills, endorsements, experience, certs |
| Target role analysis | Role title | Required skills with importance levels |
| Code quality scoring | Code samples (batch of 4) | Quality ratings (1-5 on 5 dimensions) |
| README quality scoring | README contents (batch of 3) | Quality ratings (1-5 on 5 dimensions) |
| Gap analysis | Evidence scores + skills | Projects, quick wins, readiness % |
| Chat responses | User message + scan context | Career advice |
| Bullet generation | Project description + tech stack | Resume bullet point |

---

## 3. Supabase

**Libraries:** `@supabase/supabase-js` (backend), `@supabase/ssr` (frontend)

**Services used:**

| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Store scans, chats, profiles |
| **Auth** | Email signup/login, JWT tokens, session management |
| **Storage** | Store uploaded resume and LinkedIn PDFs |
| **Row Level Security** | Users can only access their own data |
