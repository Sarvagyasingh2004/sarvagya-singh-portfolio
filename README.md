# sarvagya-singh-portfolio

One Next.js app. Pages and API routes together, deployed on Vercel.

```
frontend/
  app/            routes + API (chat, contact, events, resume, cron)
  components/     UI, including the WebGL scenes
  sections/       page sections
  knowledge/      the assistant's corpus (markdown)
  private/        resume PDF — gitignored, no public URL, served via /api/resume
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
| `npm run resume:push` | Upload `private/resume.pdf` to MongoDB for production |

## API

| Route | Notes |
|---|---|
| `GET /api/health` | Feature flags + DB state |
| `POST /api/chat` | SSE stream, 30/hr per IP |
| `POST /api/contact` | Zod + honeypot, stored in MongoDB, emailed if Resend is configured |
| `POST /api/events` | Client beacon, always 204 |
| `GET /api/resume` | Serves `private/resume.pdf` locally, from MongoDB in production; logs the request |
| `GET /api/cron/digest` | Nightly report, guarded by `CRON_SECRET` |

## The assistant

The corpus in `knowledge/*.md` is concatenated in sorted filename order and
sent as the Gemini system instruction. It is roughly 4,000 tokens, so there is
deliberately **no vector store and no retrieval step** — the whole thing fits
in context, and RAG would add an embedding pipeline plus a similarity-tuning
problem to select from a set that already fits. Retrieval becomes the right
call well above this size.

`knowledge/99-boundaries.md` holds the answering rules. The assistant may
reason across the corpus, explain the technical concepts the work involves, and
compare that experience against a pasted job description — but it may not
invent an employer, date, metric or technology, discuss compensation, or give
out a phone number, and a visitor's message is treated as data rather than as
instructions.

## Docs

- [docs/deploy-vercel.md](docs/deploy-vercel.md) — deployment, domain, free tiers
- [docs/testimonials-setup.md](docs/testimonials-setup.md) — Google Form pipeline
- [frontend/docs/adding-tech-logos.md](frontend/docs/adding-tech-logos.md) — adding a 3D logo to the constellation

## Deploys

Vercel builds and deploys on every push to `main`; pull requests get their own
preview URL. There is no GitHub Actions workflow because there is nothing for
one to do — Vercel's own integration handles it.
