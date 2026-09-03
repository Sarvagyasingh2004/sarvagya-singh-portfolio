# sarvagya-singh-portfolio

Monorepo. Two deployables.

```
frontend/   Vite + React SPA (migrating to Next.js static export)
            -> S3 + CloudFront behind Origin Access Control
backend/    Express 5 API — Gemini chatbot, contact, events, resume
            -> EC2 behind an Nginx reverse proxy
```

## Local development

```bash
# terminal 1
cd backend && npm install && cp .env.example .env   # add GEMINI_API_KEY
npm run dev                                          # http://127.0.0.1:3001

# terminal 2
cd frontend && npm install && cp .env.example .env
npm run dev                                          # http://localhost:5173
```

Only `GEMINI_API_KEY` is required. The API starts and the chatbot works without
MongoDB, S3 or SES configured — those features report themselves as disabled on
`GET /api/health` rather than crashing the process.

## API

| Route | Method | Notes |
|---|---|---|
| `/api/health` | GET | Feature flags and connection state |
| `/api/chat` | POST | SSE stream. Rate limited to 15/hr per IP |
| `/api/contact` | POST | Honeypot + Zod validated |
| `/api/events` | POST | Client beacon, returns 204 |
| `/api/resume` | GET | Presigned S3 URL (not yet wired) |

## Chatbot design

The knowledge corpus in `backend/knowledge/*.md` is concatenated in sorted
filename order and sent as the Gemini system instruction. At ~2,200 tokens it
sits below the threshold where explicit context caching earns its complexity,
so there is deliberately no vector store and no retrieval step — the whole
corpus fits in context. Retrieval becomes the right call well above this size.

`knowledge/99-boundaries.md` holds the answering rules: corpus-only answers, no
compensation discussion, and visitor messages treated as data rather than
instructions.

## Deployment

Two GitHub Actions workflows, path-filtered so a frontend change does not
redeploy the API. Both authenticate to AWS via OIDC — no stored access keys.
