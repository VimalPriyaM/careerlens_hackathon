# Chat Data Flow

## When user sends a message

```
1. User types message in chat input
2. Frontend POST /api/chat with { message, session_id?, scan_id? }
3. Backend creates session if new (inserts into chat_sessions)
4. Backend loads linked scan data (if scan_id provided)
5. Backend loads last 20 messages from session (token limit management)
6. Backend builds system prompt with full scan context:
   - Evidence scores for all skills
   - Conflicts and hidden skills
   - Project recommendations
   - Quick wins
   - GitHub, LinkedIn, resume summaries
7. Messages sent to Groq LLM (Llama 3.3 70B):
   [system_prompt, ...last_20_messages, new_user_message]
8. LLM response stored as assistant message in chat_messages
9. User message also stored in chat_messages
10. Response returned to frontend
11. Frontend displays assistant reply in chat bubble
```

## Session Management

- Each conversation is a "session" with its own message history
- Sessions can be linked to a specific scan for role-specific context
- Session list shows in the sidebar with titles and timestamps
- Starting a new chat creates a new session
- If no scan_id provided, backend tries to use the session's linked scan

## Token Limit Handling

Only the **last 20 messages** are sent to the LLM. Older messages stay in the database but aren't included in the context window. This prevents token limit errors during long conversations.
