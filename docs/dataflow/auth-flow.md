# Authentication Flow

## Email Signup

```
1. User enters name + email + password on /signup
2. supabase.auth.signUp() called with emailRedirectTo
3. Supabase creates user → sends verification email
4. User clicks link in email
5. Link redirects to: https://your-app/auth/callback?code=xxx
6. /auth/callback route exchanges code for session cookie
7. User redirected to /dashboard
```

## Email Login

```
1. User enters email + password on /login
2. supabase.auth.signInWithPassword() called
3. Session JWT stored in cookie
4. User redirected to /dashboard
```

## Session Management

**Frontend middleware** (`middleware.ts`) runs on every `/dashboard/*` request:
- Checks for Supabase session cookie
- If session expired → refreshes token automatically
- If no session at all → redirects to `/login`

**Backend auth middleware** runs on every API request:
- Extracts Bearer token from `Authorization` header
- Verifies JWT signature using `SUPABASE_JWT_SECRET`
- Extracts `user_id` from token payload
- Attaches `userId` to the request object
- Returns 401 if token is invalid or missing

## Important: Production Auth Setup

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL** must be your production URL (this is what goes in verification emails)
- **Redirect URLs** must include your production callback URL
