# Architecture Overview

CareerLens is a three-tier application: **Next.js frontend**, **Express backend**, and **Supabase** (PostgreSQL + Auth + Storage).

## System Diagram

```
┌──────────────────────────────────┐
│       User Browser                │
│  Next.js 14 Frontend (Vercel)    │
│  - Dashboard, Scan, Chat pages   │
│  - Supabase Auth (JWT cookies)   │
└──────────────┬───────────────────┘
               │ HTTPS + Bearer Token
               ▼
┌──────────────────────────────────┐
│   Express Backend (Render)       │
│  - Scan pipeline (parallel)       │
│  - Evidence scoring engine        │
│  - Chat service                   │
│  - PDF parsing (pdf-parse)        │
└───────┬──────────┬───────────────┘
        │          │
        ▼          ▼
┌────────────┐  ┌──────────────────┐
│  Supabase  │  │  External APIs    │
│ - Postgres │  │ - GitHub REST API │
│ - Auth     │  │ - Groq LLM API   │
│ - Storage  │  │                   │
└────────────┘  └──────────────────┘
```

## How the pieces connect

1. **User signs up/logs in** via Supabase Auth on the frontend
2. **Frontend sends JWT token** with every API request to the backend
3. **Backend verifies the token** using Supabase JWT secret
4. **Scan pipeline** fetches data from GitHub API and processes PDFs with Groq LLM
5. **Results stored** in Supabase PostgreSQL, PDFs in Supabase Storage
6. **Dashboard reads** scan data from Supabase via the backend API
7. **Chat** sends messages to Groq LLM with scan context for personalized advice
