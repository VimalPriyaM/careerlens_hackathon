# Frontend Architecture

**Framework:** Next.js 14 (App Router)
**Language:** TypeScript
**Styling:** Tailwind CSS
**UI Components:** @base-ui/react + custom components
**State:** Zustand
**Charts:** Recharts
**Deployed on:** Vercel

## File Structure

```
frontend/src/
├── app/
│   ├── page.tsx                    → Landing page
│   ├── login/page.tsx              → Email login
│   ├── signup/page.tsx             → Email signup
│   ├── auth/callback/route.ts      → Supabase auth callback (exchanges code for session)
│   ├── dashboard/
│   │   ├── layout.tsx              → Sidebar shell (responsive, collapsible)
│   │   ├── page.tsx                → Main dashboard (fetches latest scan + history)
│   │   ├── scan/page.tsx           → Scan form + progress + results
│   │   ├── scan/[id]/page.tsx      → Individual scan detail
│   │   ├── chat/page.tsx           → AI co-pilot with session sidebar
│   │   └── history/page.tsx        → Scan history with score deltas
│   └── middleware.ts               → Protects /dashboard routes, refreshes sessions
│
├── components/
│   ├── dashboard/
│   │   ├── ScanDashboard.tsx       → Main dashboard orchestrator
│   │   ├── KPICards.tsx            → Score gauge + 3 stat cards with deltas
│   │   ├── EvidenceMatrix.tsx      → Interactive skill table (expandable rows)
│   │   ├── SkillCoverageBar.tsx    → Horizontal bar chart (all skills by score)
│   │   ├── StrengthDistributionBar.tsx → Stacked bar + source coverage
│   │   ├── FocusAreas.tsx          → Top strengths + priority weak skills
│   │   ├── ProjectCard.tsx         → Project recommendation card
│   │   ├── ProjectRoadmap.tsx      → Project list container
│   │   ├── QuickWins.tsx           → Interactive checklist with score boost
│   │   ├── SkillDetailPanel.tsx    → Expanded skill detail (5 components)
│   │   └── DashboardSkeleton.tsx   → Loading skeleton
│   ├── chat/
│   │   ├── ChatInterface.tsx       → Messages, input, quick actions
│   │   └── BulletGenerator.tsx     → Resume bullet generation tool
│   └── ui/
│       ├── sidebar.tsx             → Composable sidebar system
│       ├── card.tsx, button.tsx... → Base UI components
│
├── lib/
│   ├── supabase-browser.ts        → Supabase client (browser)
│   ├── supabase-server.ts         → Supabase client (server)
│   ├── api.ts                     → API wrapper (fetch + error handling)
│   ├── analytics.ts               → Dynamic metric computation
│   └── utils.ts                   → Score colors, formatting helpers
│
├── store/
│   └── useProfileStore.ts         → Zustand store (user, scan cache, history)
│
└── types/
    └── index.ts                   → TypeScript interfaces
```

## Key Patterns

- **All analytics computed dynamically** from scan data in `lib/analytics.ts` — no hardcoded values
- **Zustand store** caches the latest scan to avoid refetching on navigation
- **Dashboard page** fetches scan history + previous scan for delta comparisons
- **Middleware** protects all `/dashboard/*` routes and refreshes expired sessions
