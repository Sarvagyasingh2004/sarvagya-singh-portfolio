# Testimonials via Google Form — setup

Approved rows in a Google Sheet become testimonials on the site. No rebuild and
no deploy: the page re-reads the sheet at most once an hour and regenerates
itself in the background (Next.js ISR).

```
Google Form   (public link you send to people)
      │  submission
      ▼
Google Sheet  ── you set `approved` to yes      ◄── manual gate, always
      │
      ▼
Apps Script web app  →  JSON array at /exec
      │
      ▼
TESTIMONIALS_URL  →  read hourly, server-rendered, crawlable
```

The `approved` gate is not optional. The Form link is public, so anyone can
submit anything; nothing renders until you set that cell yourself.

If the sheet is unreachable, malformed, or `TESTIMONIALS_URL` is unset, the
site falls back to `frontend/content/testimonials.json` rather than showing an
empty section.

---

## 1. The Form

Create a Google Form with these questions, in any order:

| Question | Type | Required |
|---|---|---|
| Your name | Short answer | yes |
| Your role and company | Short answer | no |
| Your testimonial | Paragraph | yes |

Responses → **Link to Sheets** → create a new spreadsheet.

## 2. The Sheet

In the responses sheet, rename the header cells so the script can find them.
The script matches on these names, lower-cased, so the exact wording of your
Form question does not matter:

| Column header | Becomes |
|---|---|
| `name` | the person's name |
| `role` | the line under their name (optional) |
| `review` | the testimonial body |
| `approved` | the gate — type `yes` to publish |

Add the `approved` column yourself; the Form will not create it.

## 3. The Apps Script

In the sheet: **Extensions → Apps Script**, replace everything with:

```js
const SHEET_NAME = 'Form Responses 1';

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const [header, ...rows] = sheet.getDataRange().getValues();

  const col = (want) =>
    header.findIndex((h) => String(h).trim().toLowerCase() === want);

  const iName = col('name');
  const iRole = col('role');
  const iReview = col('review');
  const iApproved = col('approved');

  const out = rows
    .filter((r) => String(r[iApproved]).trim().toLowerCase() === 'yes')
    .map((r) => ({
      name: String(r[iName] || '').trim(),
      mentions: iRole > -1 ? String(r[iRole] || '').trim() : '',
      review: String(r[iReview] || '').trim(),
      imgPath: '',
    }))
    .filter((t) => t.name && t.review);

  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

Then **Deploy → New deployment → Web app**:

- Execute as: **Me**
- Who has access: **Anyone**

Copy the `/exec` URL it gives you.

> Access must be **Anyone**, not "Anyone with a Google account" — the site
> fetches this without signing in. The sheet itself stays private; only this
> JSON is exposed, and it only ever contains approved rows.

## 4. Wire it up

Add the URL to `frontend/.env.local` for local work, and to the Vercel project's
environment variables for production:

```
TESTIMONIALS_URL=https://script.google.com/macros/s/…/exec
```

Check it first — this should print a JSON array:

```bash
curl -sL "$TESTIMONIALS_URL"
```

`[]` is a correct answer when nothing is approved yet. The site then keeps its
committed fallback, and the section hides itself entirely rather than showing
an empty heading.

## What the site does with each field

- **name** — required. A row without one is dropped.
- **review** — required. Same.
- **mentions** — optional, shown under the name.
- **imgPath** — left empty. Submitters do not upload photos, so the card draws
  a lettered monogram instead of requesting a file that does not exist.
