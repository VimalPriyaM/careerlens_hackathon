# Scan History & Deltas

Track progress across multiple scans.

## How it works

- Every scan creates a new database row (even for the same role)
- History page lists all scans sorted by newest first
- Each scan shows: role, date, score, verified count
- Score delta computed between consecutive scans for the same role

## Delta calculation

For each scan in the history list:
1. Find the next oldest scan with the same target role
2. Compute: `delta = currentScan.overall_score - previousScan.overall_score`
3. Display as green (positive) or red (negative) badge

## Dashboard integration

The main dashboard fetches:
- Latest scan (full detail for display)
- Previous scan for same role (for delta comparison in KPI cards)
- Full scan list (for trend data, if trend chart is enabled)

## Same role scanned twice

Works correctly:
- Both scans stored independently
- History shows both with score delta between them
- Dashboard shows improvement/regression from previous
