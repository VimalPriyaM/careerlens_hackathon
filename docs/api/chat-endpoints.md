# Chat API Endpoints

## POST /api/chat — Send a Message

Sends a message to the AI co-pilot. Creates a new session if none provided.

**Body:**
```json
{
  "message": "What should I focus on?",
  "session_id": "uuid (optional)",
  "scan_id": "uuid (optional)"
}
```

- Omit `session_id` to start a new conversation
- `scan_id` links the chat to a specific scan for context

**Response:**
```json
{
  "session_id": "uuid",
  "reply": "Based on your evidence scores, I'd recommend focusing on...",
  "created_at": "2026-03-28T10:35:00.000Z"
}
```

**Rate Limit:** 30 messages per 15 minutes per IP.

**How it works:**
1. Creates or loads chat session
2. Loads linked scan data as system context
3. Takes last 20 messages for conversation history
4. Sends to LLM with full career context
5. Stores both user + assistant messages in database

---

## GET /api/chat/sessions — List Chat Sessions

Returns all chat sessions for the user.

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "title": "Career strategy discussion",
      "scan_id": "uuid or null",
      "created_at": "2026-03-28T10:30:00.000Z",
      "updated_at": "2026-03-28T10:35:00.000Z"
    }
  ]
}
```

---

## GET /api/chat/sessions/:sessionId/messages — Get Messages

Returns all messages in a chat session.

**Response:**
```json
{
  "messages": [
    { "id": "uuid", "role": "user", "content": "...", "created_at": "..." },
    { "id": "uuid", "role": "assistant", "content": "...", "created_at": "..." }
  ]
}
```
