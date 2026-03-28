# Environment Variables

## Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

GROQ_API_KEY=your-groq-api-key

GITHUB_TOKEN=your-github-personal-access-token
```

| Variable | Where to find it |
|----------|-----------------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Secret |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `GITHUB_TOKEN` | [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token |

## Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Same as backend SUPABASE_URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Your frontend URL (localhost for dev, Vercel URL for prod) |
| `NEXT_PUBLIC_API_URL` | Your backend URL + `/api` |
