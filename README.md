# sarvagya-singh-portfolio

One Next.js app. Pages and API routes together, deployed on Vercel.

```
frontend/
  app/            routes + API (chat, contact, events, resume, cron)
  components/     UI, including the WebGL scenes
  sections/       page sections
  knowledge/      the assistant's corpus (markdown)
  private/        resume PDF — no public URL, served via /api/resume
  lib/server/     db, env, rate limiting, corpus loader
```

## Local development

```bash
cd frontend
npm install
cp .env.example .env.local     # add GEMINI_API_KEY
npm run dev                    # http://localhost:3000
```

Only `GEMINI_API_KEY` is required. Without MongoDB, Resend or the testimonials
sheet the site still runs — those features report themselves as disabled on
`GET /api/health` instead of crashing.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run icons` | Regenerate tech marquee SVGs from `simple-icons` |

## API

| Route | Notes |
|---|---|
| `GET /api/health` | Feature flags + DB state |
| `POST /api/chat` | SSE stream, 15/hr per IP |
| `POST /api/contact` | Zod + honeypot, instant email alert |
| `POST /api/events` | Client beacon, always 204 |
| `GET /api/resume` | Serves the PDF from `private/`, logs the request |
| `GET /api/cron/digest` | Nightly report, guarded by `CRON_SECRET` |

## The assistant

The corpus in `knowledge/*.md` is concatenated in sorted filename order and
sent as the Gemini system instruction. It is ~2,200 tokens, so there is
deliberately **no vector store and no retrieval step** — the whole thing fits
in context, and RAG would add an embedding pipeline plus a similarity-tuning
problem to select from a set that already fits. Retrieval becomes the right
call well above this size.

`knowledge/99-boundaries.md` holds the answering rules: corpus-only answers, no
compensation discussion, and visitor messages treated as data rather than
instructions.

## Docs

- [CONTEXT.md](CONTEXT.md) — end-to-end status: what's done, what remains
- [docs/deploy-vercel.md](docs/deploy-vercel.md) — deployment, domain, free tiers
- [docs/testimonials-setup.md](docs/testimonials-setup.md) — Google Form pipeline
