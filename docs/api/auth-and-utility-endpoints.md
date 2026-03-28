# Auth & Utility API Endpoints

## Authentication

All endpoints except `/api/health` require a Supabase JWT token:

```
Authorization: Bearer <supabase_access_token>
```

The frontend gets this token from Supabase Auth after login. The backend verifies it using the Supabase JWT secret.

---

## GET /api/health — Health Check

No auth required. Used for deployment monitoring.

**Response:** `{ "status": "ok" }`

---

## POST /api/auth/verify — Verify Token

Checks if a token is valid.

**Response:**
```json
{ "authenticated": true, "userId": "uuid" }
```

---

## POST /api/generate-bullet — Resume Bullet Generator

Generates a recruiter-ready resume bullet point from a project description.

**Body:**
```json
{
  "project_description": "Built a REST API that processes user uploads...",
  "tech_stack": ["Python", "FastAPI", "PostgreSQL"]
}
```

**Response:**
```json
{
  "bullet": "Engineered a high-throughput REST API using FastAPI and PostgreSQL, implementing file upload processing pipeline that reduced data ingestion time by 40%"
}
```

---

## Rate Limits

| Scope | Limit |
|-------|-------|
| Global (all endpoints) | 500 requests / 15 min / IP |
| Chat messages | 30 messages / 15 min / IP |
