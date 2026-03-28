# Project Structure

```
careerlens/
│
├── frontend/                       # Next.js 14 App
│   ├── src/
│   │   ├── app/                    # Pages (file-based routing)
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── login/              # Login page
│   │   │   ├── signup/             # Signup page
│   │   │   ├── auth/callback/      # Supabase auth callback
│   │   │   └── dashboard/          # Protected dashboard
│   │   │       ├── layout.tsx      # Sidebar layout
│   │   │       ├── page.tsx        # Main dashboard
│   │   │       ├── scan/           # Scan form + results
│   │   │       ├── chat/           # AI co-pilot
│   │   │       └── history/        # Scan history
│   │   ├── components/
│   │   │   ├── dashboard/          # 12 dashboard components
│   │   │   ├── chat/               # Chat + bullet generator
│   │   │   └── ui/                 # Base UI (sidebar, card, button...)
│   │   ├── lib/                    # Supabase clients, API, analytics
│   │   ├── store/                  # Zustand state
│   │   └── types/                  # TypeScript interfaces
│   ├── .env.example                # Environment template
│   └── package.json
│
├── backend/                        # Express API
│   ├── src/
│   │   ├── index.ts                # Server entry
│   │   ├── routes/                 # scan.ts, chat.ts
│   │   ├── services/               # 8 service modules
│   │   ├── scoring/                # 7 scoring modules
│   │   ├── middleware/             # auth.ts, upload.ts
│   │   ├── utils/                  # supabase, github, llm, sanitize
│   │   └── config/                 # constants.ts, prompts.ts
│   ├── .env.example                # Environment template
│   └── package.json
│
├── docs/                           # Documentation (you are here)
├── supabase-setup.sql              # Complete database schema
├── requirements.txt                # Requirements overview
└── README.md                       # Project README
```
