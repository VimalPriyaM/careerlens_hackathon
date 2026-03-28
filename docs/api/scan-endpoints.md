# Scan API Endpoints

## POST /api/scan — Create a New Scan

Runs the full evidence analysis pipeline.

**Content-Type:** `multipart/form-data`

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | PDF file | Yes | Resume, max 5MB |
| `linkedin` | PDF file | Yes | LinkedIn export PDF, max 5MB |
| `github_username` | String | Yes | GitHub username |
| `target_role` | String | Yes | Target job role |

**What happens:**
1. All 4 extraction pipelines run in parallel (resume, LinkedIn, GitHub, target role)
2. Evidence scoring runs for each skill (5 components)
3. Cross-reference classification (8 statuses)
4. Gap analysis generates projects + quick wins
5. Everything stored in Supabase

**Success Response (200):**
```json
{
  "scan_id": "uuid",
  "target_role": "Senior Backend Engineer",
  "overall_score": 58,
  "verified_skill_count": 5,
  "total_target_skills": 12,
  "evidence_matrix": [...],
  "conflicts": [...],
  "hidden_skills": [...],
  "project_recommendations": [...],
  "delta_projection": { "current_readiness": 45, "projected_readiness": 72 },
  "gap_summary": "Strong Python skills but missing cloud evidence...",
  "quick_wins": ["Add Docker to resume", "Request Python endorsements"],
  "notes": [],
  "created_at": "2026-03-28T10:30:00.000Z"
}
```

**Error Responses:**

| Status | When |
|--------|------|
| 400 | Missing files, invalid GitHub username, empty target role |
| 502 | Extraction pipeline failed (resume parse, GitHub API, etc.) |
| 500 | Database storage failed or unexpected error |

---

## GET /api/scans — List User's Scans

Returns scan summaries for the authenticated user, sorted by newest first.

**Query Params:** `?limit=20&offset=0`

**Response:**
```json
{
  "scans": [
    {
      "id": "uuid",
      "target_role": "Senior Backend Engineer",
      "overall_score": 58,
      "verified_skill_count": 5,
      "total_target_skills": 12,
      "created_at": "2026-03-28T10:30:00.000Z"
    }
  ],
  "total": 3
}
```

---

## GET /api/scans/:id — Get Full Scan Details

Returns the complete scan record with all evidence data, components, recommendations.

**Response:** Same shape as the POST /api/scan response, plus all stored raw data (resume text, LinkedIn skills, GitHub data).
