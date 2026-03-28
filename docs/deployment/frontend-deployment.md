# Frontend Deployment (Vercel)

## Steps

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Set **Root Directory** to `frontend`
4. Framework preset: **Next.js** (auto-detected)
5. Add environment variables (see below)
6. Click Deploy

## Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.render.com/api` |

## Build Settings

- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node.js Version:** 18.x

## After Deployment

- Update Supabase **Site URL** to your Vercel URL
- Add `https://your-app.vercel.app/auth/callback` to Supabase redirect URLs
- Verify email verification links point to production (not localhost)
