# Database Setup

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Choose a name and password
4. Select a region close to your users
5. Wait for provisioning (~1 minute)

## Step 2: Run the Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file `supabase-setup.sql` from the project root
4. Copy and paste the entire contents
5. Click **Run**

## What gets created

**Tables:**
- `profiles` — user metadata (auto-created on signup)
- `scans` — complete scan results
- `chat_sessions` — chat conversations
- `chat_messages` — individual messages

**Storage:**
- `user-documents` bucket (private, PDF only, 5MB limit)

**Security:**
- Row Level Security on all tables
- Users can only read/write their own data

**Triggers:**
- Auto-create profile when user signs up
- Auto-increment scan count when scan is created

## Step 3: Configure Auth

Go to **Authentication** → **URL Configuration**:

- **Site URL:** `http://localhost:3000` (change to production URL later)
- **Redirect URLs:** Add `http://localhost:3000/auth/callback`

## Step 4: Verify

Check that everything was created:
- **Table Editor:** You should see 4 tables
- **Storage:** You should see `user-documents` bucket
- **Authentication → Users:** Should be empty (ready for signups)
