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

Three questions. Word them however you like — the script matches loosely, so
you do not have to rename anything afterwards.

| Question | Type | Required |
|---|---|---|
| Your name | Short answer | **yes** |
| Your role and company | Short answer | no |
| Your testimonial | Paragraph | **yes** |

That is the whole form. No photo upload — the card draws a lettered monogram,
so a missing picture is a design choice rather than a broken image.

Then **Responses → Link to Sheets → Create a new spreadsheet**.

## 2. The Sheet

The Form creates a `Timestamp` column plus one per question. You add **one**
column by hand, at the end:

| Column | Who creates it | What it does |
|---|---|---|
| Timestamp | the Form | ignored |
| Your name | the Form | the person's name |
| Your role and company | the Form | the line under their name |
| Your testimonial | the Form | the quote |
| **`approved`** | **you** | the gate — type `yes` to publish |

The `approved` gate is not optional. The Form link is public, so anyone can
submit anything; nothing reaches the site until you type `yes` in that cell
yourself.

## 3. The Apps Script

In the sheet: **Extensions → Apps Script**, replace everything with this, then
save.

```js
const SHEET_NAME = 'Form Responses 1';

// Matched loosely against the header row so the Form's own wording works
// as-is. An exact header (`name`, `role`, `review`) always wins if you would
// rather rename the columns.
const FIELDS = {
  name: [/\bname\b/],
  role: [/\brole\b/, /\bcompany\b/, /\btitle\b/, /\bposition\b/],
  review: [/\btestimonial\b/, /\breview\b/, /\bfeedback\b/, /\bquote\b/],
  approved: [/\bapprove/],
};

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) return out({ error: 'No sheet named ' + SHEET_NAME });

  const [header, ...rows] = sheet.getDataRange().getValues();
  const head = header.map((c) => String(c).trim().toLowerCase());

  const col = (key) => {
    const exact = head.indexOf(key);
    if (exact > -1) return exact;
    for (const re of FIELDS[key]) {
      const i = head.findIndex((c) => re.test(c));
      if (i > -1) return i;
    }
    return -1;
  };

  const iName = col('name');
  const iRole = col('role');
  const iReview = col('review');
  const iApproved = col('approved');

  // Returning the problem rather than an empty list: the site falls back to its
  // committed testimonials either way, but this way opening the URL tells you
  // which column is missing instead of showing a silent [].
  const missing = [];
  if (iName < 0) missing.push('name');
  if (iReview < 0) missing.push('review');
  if (iApproved < 0) missing.push('approved');
  if (missing.length) return out({ error: 'Missing column(s): ' + missing.join(', '), headers: head });

  const list = rows
    .filter((r) => String(r[iApproved]).trim().toLowerCase() === 'yes')
    .map((r) => ({
      name: String(r[iName] || '').trim(),
      mentions: iRole > -1 ? String(r[iRole] || '').trim() : '',
      review: String(r[iReview] || '').trim(),
      imgPath: '',
    }))
    .filter((t) => t.name && t.review);

  return out(list);
}

function out(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
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
> JSON is exposed, and it only ever contains rows you approved.

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

If instead you get `{"error": "Missing column(s): approved", "headers": [...]}`,
the script found the sheet but not that column — the response lists the headers
it did see, so you can spot the mismatch. The site treats anything that is not
an array as a failure and falls back, so a half-configured sheet can never blank
the section.

## What the site does with each field

- **name** — required. A row without one is dropped.
- **review** — required. Same.
- **mentions** — optional, shown under the name.
- **imgPath** — left empty. Submitters do not upload photos, so the card draws
  a lettered monogram instead of requesting a file that does not exist.
