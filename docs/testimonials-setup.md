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

Two questions are required; role and company are optional and may be one
question or two. Word them however you like — the script matches loosely, so
you do not have to rename anything afterwards.

| Question | Type | Required |
|---|---|---|
| What is your name? | Short answer | **yes** |
| Where do you work? | Short answer | no |
| What is your current role? | Short answer | no |
| Write your testimonial here | Paragraph | **yes** |

Role and company are joined into the single line the card shows under the
name — "Engineering Manager, Kraftshala" — so asking for them separately costs
nothing. Asking as one question works too.

No photo upload: the card draws a lettered monogram, so a missing picture is a
design choice rather than a broken image.

Then **Responses → Link to Sheets → Create a new spreadsheet**.

## 2. The Sheet

The Form creates a `Timestamp` column plus one per question. You add **one**
column by hand, at the end:

| Column | Who creates it | What it does |
|---|---|---|
| Timestamp | the Form | ignored |
| What is your name? | the Form | the person's name |
| Where do you work? | the Form | joined into the line under their name |
| What is your current role? | the Form | joined into the same line |
| Write your testimonial here | the Form | the quote |
| **`approved`** | **you** | the gate — type `yes` to publish |

The `approved` gate is not optional. The Form link is public, so anyone can
submit anything; nothing reaches the site until you type `yes` in that cell
yourself.

## 3. The Apps Script

In the sheet: **Extensions → Apps Script**, replace everything with this, then
save.

```js
// The TAB name along the bottom of the spreadsheet — not the file name. Google
// creates it as 'Form Responses 1'. If you renamed the tab, or the file, this
// falls back to the first tab, so in practice you never have to touch it.
const SHEET_NAME = 'Form Responses 1';

// Matched loosely against the header row so the Form's own wording works
// as-is. An exact header (`name`, `role`, `review`) always wins if you would
// rather rename the columns.
//
// Resolved in this order, each field skipping columns already claimed, so a
// loose pattern cannot steal a column a later field needs.
const ORDER = ['name', 'review', 'approved', 'role', 'company'];
const FIELDS = {
  name: [/\bname\b/],
  review: [/\btestimonial\b/, /\breview\b/, /\bfeedback\b/, /\bquote\b/],
  approved: [/\bapprove/],
  role: [/\brole\b/, /\btitle\b/, /\bposition\b/, /\bdesignation\b/],
  company: [/\bcompany\b/, /\bemployer\b/, /\borgani[sz]ation\b/, /\bwork\b/],
};

function doGet() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (!sheet) return out({ error: 'This spreadsheet has no tabs.' });

  const [header, ...rows] = sheet.getDataRange().getValues();
  const head = header.map((c) => String(c).trim().toLowerCase());

  const at = {};
  const claimed = {};
  ORDER.forEach((key) => {
    let i = head.indexOf(key);
    if (i < 0 || claimed[i]) {
      i = -1;
      for (const re of FIELDS[key]) {
        const j = head.findIndex((c, n) => !claimed[n] && re.test(c));
        if (j > -1) { i = j; break; }
      }
    }
    at[key] = i;
    if (i > -1) claimed[i] = true;
  });

  // Returning the problem rather than an empty list: the site falls back to its
  // committed testimonials either way, but this way opening the URL tells you
  // which column is missing instead of showing a silent [].
  const missing = ['name', 'review', 'approved'].filter((k) => at[k] < 0);
  if (missing.length) {
    return out({
      error: 'Missing column(s): ' + missing.join(', '),
      readingTab: sheet.getName(),
      headers: head,
    });
  }

  const cell = (row, key) => (at[key] > -1 ? String(row[at[key]] || '').trim() : '');

  const list = rows
    .filter((r) => String(r[at.approved]).trim().toLowerCase() === 'yes')
    .map((r) => ({
      name: cell(r, 'name'),
      // The card shows one line under the name, so a separate role and company
      // are joined into it rather than one of them being dropped.
      mentions: [cell(r, 'role'), cell(r, 'company')].filter(Boolean).join(', '),
      review: cell(r, 'review'),
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
