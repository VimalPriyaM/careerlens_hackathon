# KPI Dashboard

Dynamic overview cards showing key metrics — all computed from scan data, never hardcoded.

## KPI Cards

| Card | What it shows | Comparison |
|------|--------------|-----------|
| **Overall Score** | Animated gauge (0-100) | +/- points from previous scan |
| **Current Readiness** | % ready for target role | +/- % from previous scan |
| **Skills Verified** | Count of skills >= 55 score | +/- skills from previous scan |
| **Avg. Skill Score** | Mean across all skills | Breakdown: critical / strong / weak |

## How deltas are computed

```
change = currentScan.score - previousScan.score
percentChange = ((current - previous) / previous) * 100
```

The system finds the most recent previous scan for the same target role to compute meaningful comparisons.

## Visual indicators

- Green up arrow + positive number = improvement
- Red down arrow + negative number = regression
- Neutral dash = no change or first scan
