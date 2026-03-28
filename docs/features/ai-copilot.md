# AI Co-pilot Chat

Personalized career assistant that references your actual scan data.

## What makes it different from generic ChatGPT

The AI co-pilot has your full scan context in its system prompt:
- All evidence scores for every skill
- Conflicts and hidden skills
- Project recommendations
- Quick wins
- GitHub profile summary
- LinkedIn profile summary
- Resume summary

So when you ask "What should I focus on?", it answers based on your actual data — not generic advice.

## Features

- **Session-based:** Conversations persist across visits
- **Scan-linked:** Each session can reference a specific scan
- **Quick actions:** Pre-built questions ("What's my biggest weakness?", etc.)
- **Message history:** Last 20 messages sent for context (prevents token overflow)
- **Resume bullet generator:** Turn project descriptions into polished resume bullets

## Rate limit

30 messages per 15 minutes per IP.
