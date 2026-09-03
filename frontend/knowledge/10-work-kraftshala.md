# Kraftshala — Software Development Engineer (Full-Stack)
March 2026 – September 2026 · Delhi, India

An EdTech / career-accelerator startup. Worked across two production
repositories: `kraftshala_api2` (Node.js, TypeScript, Express, Sequelize, MySQL)
and `kfops_v2` (React, Redux internal operations platform).
331 commits total — 202 in the backend, 129 in the frontend.

## Google Chat alerting platform
A self-service alerting system. Teams define a rule through the API — a name,
a raw SQL query, a threshold, an active-hours window and a frequency. A cron
runs every minute, works out which alerts are due, executes the SQL and posts a
formatted card into Google Chat when the threshold is crossed.

Because the SQL is user-supplied, it needed a validation layer: only SELECT and
WITH statements are permitted, DDL and DML are blocked, dangerous functions
(SLEEP, INTO OUTFILE) are rejected, and required :start_time / :end_time
placeholders plus a COUNT(...) as count clause are enforced.

It started as a single hardcoded alert and was rebuilt into the dynamic,
database-driven version. Sarvagya also built the full admin UI in React/Redux —
list, create/edit, drag-reorder, activate/deactivate.

It became reusable infrastructure: a different engineer on the team later
shipped Marketing's Budget Alert and Trend Alert features on top of the
sendGChatAlert integration, without Sarvagya's involvement. He then extended it
himself twice more — an "Expert Not Joined" alert that cross-references Zoom's
live-participants API against assigned experts, and a "Stuck Meeting" alert that
fires when a Zoom meeting sits in NOT_CREATED status for over 15 minutes.

## Dashboard query optimization
Re-architected data-heavy dashboard queries using a deferred-join pattern,
cutting load time from roughly 40 seconds to roughly 400 milliseconds — about
100x. It also eliminated count/row mismatches that had been inflating
pagination totals on large datasets.

A related rewrite took an applications-listing query from 6 correlated
subqueries down to 1 pre-aggregated LEFT JOIN.

## Bulk meeting booking and upload
A spreadsheet-upload pipeline letting Program Operations bulk-schedule Zoom
sessions instead of creating them one at a time. The core service is around
3,800 lines. Three modes: batch-level (one row, one meeting), multiple-cohort
(one upload spanning several cohorts), and group bookings (pipe-separated
student emails under one expert, restricted to an allow-list of meeting types).

Every mode validates before writing anything — duplicates, timing overlaps, and
expert/student availability. Uploads are processed asynchronously through a Bull
queue rather than blocking the request, because a 2,000-row upload would
otherwise time out.

Handles 1,000+ records per upload and cut manual data-entry effort by ~80%.

## Google OAuth 2.0 SSO
Implemented end-to-end on the internal staff dashboard — backend token
verification with google-auth-library's OAuth2Client.verifyIdToken, plus the
login UI. Accounts are keyed on the immutable Google subject ID rather than
email, specifically so they survive a Workspace email rename.

Worth noting honestly: two days after shipping, a hard "admin accounts must
sign in with Google" restriction turned out to break password sign-in for some
admins. Sarvagya caught it and rolled it back within 48 hours.

## Placements Opportunity Tracker
A reusable before/after audit-log module usable against any table, transactional
owner reassignment, and an auto "On Hold" cascade — when an applicant is
shortlisted at the employer CV review stage, every other non-hired,
non-rejected applicant for that opportunity automatically moves to On Hold.
Also added HTTP 409 conflict detection on booking endpoints to prevent
double-booking an expert or student.

## Calendar invite delivery
Re-architected calendar-invite delivery to decouple event creation from email
sending, routing delivery through AWS SES instead of per-account Google
Workspace sends. Shipped behind default-off feature flags so it could be rolled
out in stages with instant rollback, and added per-recipient delivery tracking
where previously there was none — which surfaced invalid addresses that had been
failing silently.

## Other systems
KSLive (a live-webinar pipeline registering leads as Zoom attendees, capturing
attendance, sending WhatsApp reminders and syncing into LeadSquared CRM);
camera-audit analytics for a student attendance dashboard; conditional section
visibility in a custom form builder; a generalized Lookup "types" classification
system; and a Redis-backed round-robin assignment for recruiter enquiry leads.
