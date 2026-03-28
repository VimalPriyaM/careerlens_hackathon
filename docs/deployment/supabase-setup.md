# Supabase Setup

## Create Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name and region
3. Wait for provisioning to complete

## Run Database Schema

1. Go to **SQL Editor** → **New Query**
2. Open `supabase-setup.sql` from the project root
3. Paste the entire file and click **Run**

This creates:
- 4 tables: `profiles`, `scans`, `chat_sessions`, `chat_messages`
- Row Level Security policies on all tables
- Storage bucket `user-documents` (private, PDF, 5MB)
- Triggers: auto-create profile on signup, auto-increment scan count

## Configure Authentication

Go to **Authentication** → **URL Configuration**:

| Setting | Development | Production |
|---------|-------------|------------|
| **Site URL** | `http://localhost:3000` | `https://your-app.vercel.app` |
| **Redirect URLs** | `http://localhost:3000/auth/callback` | `https://your-app.vercel.app/auth/callback` |

## Get Your Keys

Go to **Settings** → **API**:

| Key | Used in | Purpose |
|-----|---------|---------|
| **Project URL** | Frontend + Backend | Supabase connection |
| **anon / public key** | Frontend only | Client-side auth |
| **service_role key** | Backend only | Full database access (never expose!) |
| **JWT Secret** | Backend only | Verify auth tokens |
