# Dashboard Data Flow

## When user visits /dashboard

1. **Check Zustand cache** — if `currentScan` exists, use it
2. **Fetch scan list** — `GET /scans?limit=20` (for history + trend data)
3. **Fetch latest scan** — `GET /scans/{latest_id}` (full detail)
4. **Fetch previous scan** — find the most recent previous scan for the same target role, fetch its details
5. **Cache in Zustand** — store for navigation without refetching

## Analytics Computation (all client-side)

All numbers on the dashboard are dynamically computed from scan data:

| Function | What it computes |
|----------|-----------------|
| `computeSkillMetrics()` | Total, strong, moderate, weak counts; averages; source breakdown |
| `computeDelta()` | Score/readiness/verified change from previous scan |
| `buildStrengthDistribution()` | Strong/Moderate/Weak percentages for stacked bar |
| `buildSourceCoverage()` | % of skills found on each source |
| `getStrongSkills()` | Top 5 skills by score |
| `getFocusAreas()` | Critical skills scoring below 60 |

## Quick Wins Score Boost

When user checks quick win items:
- `scoreBoost = round((completed / total) * 5)`
- KPI cards show `overallScore + scoreBoost` (capped at 100)
- Header shows "+N pts from quick wins"
- Client-side only — re-scanning recalculates from actual data

## PDF Export

1. User clicks "Download PDF"
2. Dynamic import of `html2canvas` + `jsPDF`
3. `html2canvas` captures the dashboard DOM as a canvas
4. Canvas converted to PNG data URL
5. `jsPDF` creates A4 PDF with the image
6. Browser downloads the file
