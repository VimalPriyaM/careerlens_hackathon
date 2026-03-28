# Edge Case Handling

## Zero public GitHub repos

- GitHub service returns empty repos array (no error)
- All GitHub scoring components (A, B, C, D) return 0
- LinkedIn component (E) still scores normally
- Dashboard note: "No public GitHub repositories found. Evidence scores rely on resume and LinkedIn only."

## Very sparse resume (1-2 skills)

- Evidence matrix still renders (target role skills drive the rows)
- Most skills show "missing" status — this is correct
- Dashboard note: "Resume appears thin — only N skills detected."

## Non-LinkedIn PDF uploaded

- pdf-parse extracts text successfully (any PDF with text works)
- LLM tries to extract LinkedIn data, returns mostly empty fields
- LinkedIn scores are naturally 0 (no skills/endorsements to match)
- Dashboard note: "LinkedIn data appears very sparse. This may not be a valid LinkedIn PDF export."

## Long chat conversations (20+ messages)

- Backend loads all messages but only sends last 20 to LLM
- Older messages stay in database for the user to scroll through
- No token limit errors

## Slow scan (> 60 seconds)

Frontend shows progressive messages:
- 30s: "Still working — analyzing GitHub repositories takes a moment..."
- 60s: "This is taking longer than usual. The analysis is still running..."
- 120s: "This is taking unusually long. Please don't close this page."

Progress indicator cycles through steps regardless of actual backend state.

## Same role scanned twice

- New scan row created with fresh UUID
- Both appear in history
- Score delta computed between them
- Each has completely independent data
