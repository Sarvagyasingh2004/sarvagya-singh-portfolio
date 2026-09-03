# Testimonials via Google Form — setup

## Why it works this way

The site is a **static export**. There is no server at request time and no ISR,
so the Google Sheet is read **once, during `next build`**, and the approved rows
are baked into the HTML.

Two consequences, both deliberate:

1. Testimonials ship as real crawlable markup, not a client-side fetch that
   Google may never execute.
2. Approving a testimonial does **not** appear instantly. It needs a rebuild —
   which the Apps Script trigger fires automatically. Lag is one deploy,
   roughly 2–3 minutes.

```
Google Form  (public link you send to people)
     │  submission
     ▼
Google Sheet ── you tick `approved` = TRUE   ◄── manual gate, always required
     │
     ├─ onFormSubmit  → emails you "new testimonial pending"
     └─ onEdit        → POST repository_dispatch to GitHub
                             │
                             ▼
                   GitHub Actions rebuild
                             │
                   next build reads /exec → JSON
                             │
                   s3 sync + CloudFront invalidation
                             ▼
                        live, ~2-3 min
```

The `approved` gate is not optional. The Form link is public, so anyone can
submit anything; nothing renders until you tick the box yourself.

## 1. Create the Form

Fields, in this order:

| Field | Type | Required |
|---|---|---|
| Your name | Short answer | yes |
| Role and company | Short answer | yes |
| How did we work together? | Short answer | yes |
| Your testimonial | Paragraph | yes |
| LinkedIn profile URL | Short answer | yes — this is your verification |
| I'm happy for this to appear publicly | Checkbox | yes |

Link it to a Sheet: **Responses → Link to Sheets**.

## 2. Add the moderation columns

In the response sheet, add two columns to the right of the generated ones:

- `approved` — leave blank; type `TRUE` to publish
- `order` — optional number for display ordering

## 3. Apps Script

**Extensions → Apps Script**, paste this, and set `GITHUB_TOKEN` /
`GITHUB_REPO` under Project Settings → Script Properties.

```javascript
// Serves only approved rows, and strips the submitter's email and LinkedIn URL
// so no PII reaches the public site.
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  const header = rows.shift().map(h => String(h).trim().toLowerCase());

  const col = name => header.findIndex(h => h.includes(name));
  const iName = col('name');
  const iRole = col('role');
  const iReview = col('testimonial');
  const iApproved = col('approved');
  const iOrder = col('order');

  const out = rows
    .filter(r => String(r[iApproved]).toUpperCase() === 'TRUE')
    .map(r => ({
      name: String(r[iName] || '').trim(),
      mentions: String(r[iRole] || '').trim(),
      review: String(r[iReview] || '').trim(),
      order: Number(r[iOrder]) || 999,
    }))
    .filter(t => t.name && t.review)
    .sort((a, b) => a.order - b.order);

  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// Notify yourself when something needs moderating.
function onFormSubmit(e) {
  MailApp.sendEmail(
    'sarvagya3555cc@gmail.com',
    'New testimonial pending approval',
    'Someone submitted a testimonial. Tick `approved` in the sheet to publish it:\n\n'
      + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  );
}

// Ticking `approved` triggers a site rebuild.
function onEdit(e) {
  const header = e.source.getActiveSheet()
    .getRange(1, 1, 1, e.source.getActiveSheet().getLastColumn())
    .getValues()[0].map(h => String(h).trim().toLowerCase());

  const approvedCol = header.findIndex(h => h.includes('approved')) + 1;
  if (e.range.getColumn() !== approvedCol) return;

  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('GITHUB_TOKEN');
  const repo  = props.getProperty('GITHUB_REPO'); // e.g. "sarvagya/portfolio"
  if (!token || !repo) return;

  UrlFetchApp.fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
    payload: JSON.stringify({ event_type: 'cms-update' }),
    muteHttpExceptions: true,
  });
}
```

**Deploy → New deployment → Web app**
- Execute as: **Me**
- Who has access: **Anyone**

That gives you a `/exec` URL that returns JSON with no API key in your app.

Then add the two triggers under the clock icon: `onFormSubmit` (event: On form
submit) and `onEdit` (event: On edit).

## 4. Wire it up

`frontend/.env.local`, and as a GitHub Actions secret:

```
TESTIMONIALS_URL=https://script.google.com/macros/s/AKfy.../exec
```

GitHub PAT for the dispatch: fine-grained, single repo, **Contents: write**.

## 5. Behaviour without any of this

- `TESTIMONIALS_URL` unset → falls back to `frontend/content/testimonials.json`
- Sheet down, times out, or returns malformed JSON → same fallback, build still
  succeeds with a warning
- Zero approved rows → **the section does not render at all.** An empty
  "What People Say About Me?" heading looks worse than no section.

## 6. Who to actually ask

Realistic, and all real:

- Your Kraftshala manager and teammates (lokesh, rishik, mohit)
- The BWS point of contact
- Coding Blocks students you mentored — you taught 100+ people Java and DSA,
  which is a testimonial source most early-career candidates simply don't have

Three real ones beat six invented ones, which is what was there before.
