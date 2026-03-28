# Tech Stack

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2 | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| @base-ui/react | 1.3 | Base UI primitives |
| Recharts | 3.8 | Charts (bar, area) |
| Zustand | 5.0 | Lightweight state management |
| Lucide React | 1.7 | Icon library |
| React Dropzone | 15.0 | File upload drag-and-drop |
| html2canvas | 1.4 | DOM to canvas (PDF export) |
| jsPDF | 4.2 | PDF generation |
| @supabase/ssr | 0.9 | Supabase client for Next.js |

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | 5.x | HTTP server |
| TypeScript | 6.x | Type safety |
| @octokit/rest | 22.x | GitHub REST API client |
| openai | 6.x | Groq LLM client (OpenAI-compatible) |
| pdf-parse | 1.1 | PDF text extraction |
| multer | 2.1 | Multipart file upload handling |
| helmet | 8.x | Security headers |
| cors | 2.8 | Cross-origin support |
| express-rate-limit | 8.x | API rate limiting |
| jsonwebtoken | 9.x | JWT verification |
| @supabase/supabase-js | 2.100 | Database client |

## Infrastructure

| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL + Auth + Storage + RLS |
| Vercel | Frontend hosting |
| Railway | Backend hosting |
| Groq | LLM API (Llama 3.3 70B) |
| GitHub API | Repository analysis |
