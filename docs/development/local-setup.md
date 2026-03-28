# Local Development Setup

## Prerequisites

- Node.js >= 18
- npm >= 9
- Supabase account (free tier)
- Groq API key (free tier)
- GitHub Personal Access Token

## Quick Start

```bash
git clone https://github.com/VimalPriyaM/careerlens_hackathon.git
cd careerlens_hackathon

# Backend
cd backend
cp .env.example .env       # Edit with your keys
npm install
npm run dev                 # http://localhost:3001

# Frontend (new terminal)
cd frontend
cp .env.example .env.local  # Edit with your keys
npm install
npm run dev                 # http://localhost:3000
```

## Getting API Keys

**Supabase:** Create project → Settings → API → copy URL, anon key, service role key, JWT secret

**Groq:** [console.groq.com](https://console.groq.com) → Create API key

**GitHub:** [github.com/settings/tokens](https://github.com/settings/tokens) → Generate classic token (no scopes needed)

## Test the Full Flow

1. Open `http://localhost:3000`
2. Sign up with email → check email → verify
3. Log in → New Scan
4. Upload resume PDF + LinkedIn PDF + GitHub username + target role
5. Wait 30-60 seconds
6. View dashboard with results
