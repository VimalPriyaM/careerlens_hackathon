# Backend Deployment (Railway)

## Steps

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set **Root Directory** to `backend`
3. Add environment variables (see below)
4. Railway auto-detects Node.js

## Environment Variables

| Variable | Value |
|----------|-------|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `SUPABASE_JWT_SECRET` | Your Supabase JWT secret |
| `GROQ_API_KEY` | Your Groq API key |
| `GITHUB_TOKEN` | Your GitHub Personal Access Token |

## Build & Start Commands

- **Build:** `npm run build`
- **Start:** `npm start`

## After Deployment

- Copy the Railway deployment URL
- Update `NEXT_PUBLIC_API_URL` in Vercel to: `https://your-backend.railway.app/api`
- Update `FRONTEND_URL` in Railway to your Vercel URL (for CORS)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | `FRONTEND_URL` must match your Vercel domain exactly |
| GitHub 403 | `GITHUB_TOKEN` expired or missing |
| LLM errors | `GROQ_API_KEY` invalid or rate limited |
| 502 on scan | Check Railway logs — one extraction pipeline failed |
