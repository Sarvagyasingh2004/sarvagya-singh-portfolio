# Deploy — Vercel, free, custom domain

Everything below is free except the domain. One service, not two.

## Why one service and not Render

The whole app — pages *and* API routes — runs on Vercel. That removes three
problems in one move:

| Problem | Why it's gone |
|---|---|
| Render free tier sleeps after ~15 min idle | Vercel functions don't sleep. **No keep-alive cron needed.** |
| CORS between two origins | API routes are same-origin. No CORS at all. |
| Testimonials needed a rebuild to appear | ISR regenerates the page in the background. |

Two services would also have meant two free tiers to babysit. There is now
nothing to keep warm.

## What each free tier gives you

| Service | Free allowance | What it's for |
|---|---|---|
| **Vercel Hobby** | 100 GB bandwidth/mo, unlimited static requests, **2 cron jobs (daily)** | Hosting + API + cron |
| **MongoDB Atlas M0** | 512 MB, free forever | Chat logs, contacts, events, resume grants |
| **Resend** | 100 emails/day, 3,000/mo | Instant contact alerts + nightly digest |
| **Gemini API** | Free tier with rate limits | The assistant |
| **Google Forms + Sheets + Apps Script** | Free | Testimonials |
| **Domain** | ~₹900–1,200/yr | The only cost |

Vercel Hobby crons fire **once per day** — which is exactly what a nightly
digest needs, so this is not a constraint here.

## 1. Push to GitHub

```bash
git remote add origin git@github.com:<you>/sarvagya-singh-portfolio.git
git push -u origin main
```

## 2. Import into Vercel

1. vercel.com → **Add New → Project** → pick the repo
2. **Root Directory: `frontend`** ← the repo is a monorepo; this matters
3. Framework preset: Next.js (auto-detected). Leave build settings alone.
4. Add the environment variables from §3, then **Deploy**

That is the whole CI/CD setup. Vercel builds and deploys on every push to
`main` automatically, and gives every pull request its own preview URL. No
GitHub Actions workflow to write, no OIDC, no access keys.

## 3. Environment variables

Set these in **Project → Settings → Environment Variables** (Production +
Preview):

| Variable | Value | Required? |
|---|---|---|
| `GEMINI_API_KEY` | from aistudio.google.com | **yes** — assistant |
| `GEMINI_MODEL` | `gemini-2.5-flash` | no (has a default) |
| `MONGODB_URI` | Atlas connection string | for any persistence |
| `RESEND_API_KEY` | from resend.com | for email |
| `NOTIFY_EMAIL` | sarvagya3555cc@gmail.com | for email |
| `FROM_EMAIL` | `onboarding@resend.dev` until the domain is verified | no |
| `TESTIMONIALS_URL` | Apps Script `/exec` URL | for testimonials |
| `IP_HASH_SALT` | any long random string | **yes** in production |
| `CRON_SECRET` | any long random string | **yes** — else the digest URL is public |

Generate the two secrets with:

```bash
openssl rand -hex 32
```

**Important:** the resume PDF is gitignored, so it is not in the repo and not
in the deployment. Either commit it to a private repo, or drop it into
`frontend/private/resume.pdf` and force-add it (`git add -f`) if the repo is
private. In a **public** repo, do not commit it — it carries a phone number.

## 4. MongoDB Atlas

1. Create a free **M0** cluster
2. Database Access → add a user scoped to one database, not `atlasAdmin`
3. Network Access → **allow `0.0.0.0/0`**

That last step feels wrong but is correct here: Vercel functions have no
static outbound IP on Hobby, so there is nothing to allowlist. The database is
protected by the credentials in `MONGODB_URI`, which is why the user must be
narrowly scoped and the password long.

Until this exists, `/api/health` reports `db: false` and nothing is stored —
the site and the assistant still work, they just don't remember anything.

## 5. Custom domain

```
Registrar (Cloudflare Registrar — at cost, free WHOIS privacy)
   │
   ├─ apex   sarvagyasingh.com  →  A     76.76.21.21
   └─ www    www...             →  CNAME cname.vercel-dns.com
```

1. Vercel → Project → **Settings → Domains** → add your domain
2. Vercel shows the exact records. Add them at your registrar.
3. If DNS is on **Cloudflare**, set both records to **DNS only (grey cloud)**.
   Proxying in front of Vercel gives you double-CDN, needs SSL mode Full
   (Strict), and breaks Vercel's analytics.
4. Pick one canonical host — Vercel 301s the other automatically. Prefer apex.
5. TLS is issued and renewed by Vercel. Nothing to configure, nothing expires.

Then update the three `REPLACE_ME_DOMAIN` spots: `app/layout.tsx`,
`app/sitemap.ts`, `app/robots.ts`.

**On the TLD:** `.com` or `.dev` over `.space`. No SEO penalty on new gTLDs,
but corporate mail filters score unusual TLDs more suspiciously, and this link
gets emailed to recruiters. Avoid GoDaddy — WHOIS privacy is a paid add-on
there, so your address goes public otherwise.

## 6. Nightly digest

`vercel.json` already declares it:

```json
{ "crons": [{ "path": "/api/cron/digest", "schedule": "30 3 * * *" }] }
```

That is 03:30 UTC = **09:00 IST**. Vercel sends `Authorization: Bearer
$CRON_SECRET` automatically, and the route rejects anything else.

The email contains:

- Unique visitors, resume downloads, chatbot question count
- Every contact submission, in full
- Every question asked, verbatim
- **The questions the corpus could not answer** — the most useful section,
  because each one is a gap to go fill in `knowledge/`
- Top paths

Test it before trusting it:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/cron/digest
```

With `RESEND_API_KEY` unset it returns the report as JSON instead of emailing,
so you can see the shape immediately.

**Resend note:** until you verify a domain you can only send *to* your own
verified address, using `onboarding@resend.dev` as the sender. That is enough
for the digest and the contact alerts, since both go to you.

## 7. Testimonials — fully automatic

See [testimonials-setup.md](testimonials-setup.md) for the Form and Apps
Script. On Vercel the flow is simpler than it was under static export:

```
Form submission → Sheet → you tick `approved` = TRUE
                              │
                              ▼
              ISR re-reads the sheet within the hour
                              ▼
                    live, no rebuild, no dispatch
```

You do **not** need the `onEdit` → `repository_dispatch` trigger any more.
Keep `onFormSubmit` so you get emailed when something needs moderating.

The `approved` tick is still mandatory — the Form link is public, so anyone
can submit anything, and nothing renders until you approve it.

## 8. Interaction reports

Two layers, both free:

- **Client beacon** → `POST /api/events` on chat opens, messages and resume
  clicks. Ad-blockable, but gives interaction detail.
- **Vercel Analytics** → enable it in the dashboard (free tier included) for
  unblockable pageviews and Core Web Vitals.

The nightly digest reads the beacon events; Vercel's own dashboard covers
traffic. Between them you get both halves without paying for anything.

## Checklist

- [ ] Push to GitHub
- [ ] Import to Vercel, **Root Directory = `frontend`**
- [ ] `GEMINI_API_KEY` + `IP_HASH_SALT` + `CRON_SECRET`
- [ ] Deploy, confirm `/api/health` shows `chat: true`
- [ ] Atlas M0, `MONGODB_URI`, confirm `db: true`
- [ ] Resend key + `NOTIFY_EMAIL`, test the digest by hand
- [ ] Buy the domain, add it, update the 3 `REPLACE_ME_DOMAIN` spots
- [ ] Resume PDF into the deployment (private repo, or Vercel Blob)
- [ ] Google Form + Apps Script + `TESTIMONIALS_URL`
- [ ] Enable Vercel Analytics
- [ ] Google Search Console, submit `sitemap.xml`
