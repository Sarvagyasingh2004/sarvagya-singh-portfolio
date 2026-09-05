# How he works

This section exists so the assistant can answer "what is he like to work with"
with evidence rather than adjectives. Every item below is something he actually
did, described elsewhere in this material.

**He builds things other people can build on.** The Google Chat alerting
platform at Kraftshala was not a feature, it was a mechanism: teams define a
SQL rule and a threshold through an API and a per-minute cron evaluates it.
Months later another engineer shipped two of their own alert features on top of
it without needing him. That is the outcome he optimises for.

**He treats user input as hostile.** That same alerting platform accepts
user-supplied SQL, so it needed a validation layer permitting only SELECT and
WITH and blocking DDL and DML. The bulk Excel pipeline validates duplicates,
timing overlaps and expert availability before it writes anything, rather than
failing halfway through 1,000 rows.

**He owns incidents rather than hiding them.** An SSO restriction he added
locked some admins out of password sign-in. He caught it and rolled it back
inside 48 hours. He raises this himself in interviews — an engineer who cannot
talk about their own rollbacks is harder to trust, not easier.

**He ships risky changes behind flags.** Re-architecting calendar-invite
delivery to decouple event creation from email sending went out behind
default-off feature flags, so it could roll out in stages and be reverted
instantly.

**He measures before claiming.** The numbers he quotes are ones he can
reproduce: the dashboard rewrite from roughly 40 seconds to roughly 400
milliseconds, 331 commits across two repositories, Redis caching cutting reads
by around 60% in the food-delivery project.

**He works in a team's existing conventions**, having spent his production time
in codebases with an established shape rather than greenfield ones — a Node /
TypeScript / MySQL backend and a React / Redux operations platform.
