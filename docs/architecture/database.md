# Database Architecture

**Provider:** Supabase (managed PostgreSQL)
**Schema file:** `supabase-setup.sql` in project root

## Tables

### profiles
Stores user metadata. Auto-created on signup via trigger.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | References auth.users |
| full_name | TEXT | User's name |
| github_username | TEXT | Last used GitHub username |
| default_target_role | TEXT | Last scanned role |
| total_scans | INTEGER | Auto-incremented on scan |
| created_at | TIMESTAMPTZ | Account creation time |

### scans
Stores complete scan results. One row per scan.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Scan ID |
| user_id | UUID (FK) | Owner |
| target_role | TEXT | Job role scanned for |
| github_username | TEXT | GitHub username used |
| resume_skills | JSONB | Extracted resume data |
| linkedin_skills | JSONB | Extracted LinkedIn data |
| github_data | JSONB | GitHub profile + repos |
| target_skills | JSONB | Required skills for the role |
| evidence_scores | JSONB | Full evidence matrix |
| conflicts | JSONB | Flagged skill conflicts |
| hidden_skills | JSONB | Skills found but not on resume |
| project_recommendations | JSONB | Suggested projects |
| overall_score | INTEGER | Weighted score (0-100) |
| verified_skill_count | INTEGER | Skills scoring >= 55 |
| total_target_skills | INTEGER | Total skills analyzed |
| gap_summary | TEXT | LLM-generated gap analysis |
| quick_wins | JSONB | Quick action items |
| notes | JSONB | Edge case warnings |
| created_at | TIMESTAMPTZ | Scan timestamp |

### chat_sessions
One row per chat conversation.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Session ID |
| user_id | UUID (FK) | Owner |
| scan_id | UUID (FK, nullable) | Linked scan for context |
| title | TEXT | Auto-generated title |
| created_at / updated_at | TIMESTAMPTZ | Timestamps |

### chat_messages
One row per message (user or assistant).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Message ID |
| session_id | UUID (FK) | Parent session |
| role | TEXT | 'user' or 'assistant' |
| content | TEXT | Message text |
| created_at | TIMESTAMPTZ | Timestamp |

## Storage

**Bucket:** `user-documents` (private, PDF only, 5MB limit)

Files stored as: `{user_id}/{scan_id}_resume.pdf` and `{user_id}/{scan_id}_linkedin.pdf`

## Security

**Row Level Security** is enabled on all tables. Policies ensure users can only access their own data:

- `profiles` — SELECT/UPDATE own row
- `scans` — SELECT/INSERT/DELETE own rows
- `chat_sessions` — full CRUD on own sessions
- `chat_messages` — SELECT/INSERT where session belongs to user
- `storage.objects` — upload/read/delete in own user folder
