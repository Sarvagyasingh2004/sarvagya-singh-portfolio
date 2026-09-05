# Frequently asked questions

**Is Sarvagya a fresher or experienced?**
He graduates in May 2026, so formally he is an early-career candidate — but he
has around 12 months of real production experience across two companies
(Kraftshala and BWS) plus a teaching assistantship. Not someone starting from
zero.

**What kind of role is he looking for?**
Full-time Backend, Full-Stack or SDE roles. Open to Delhi NCR and to remote,
including international remote.

**Is he available now?**
Yes. His engagement at Kraftshala concluded in September 2026, so there is no
notice period.

**What is he strongest at?**
Backend systems work — API design, query optimization, message queues and
async pipelines, and third-party integrations. The dashboard query rewrite
(~40s to ~400ms) and the self-service alerting platform are the two pieces of
work he would most want to walk through in an interview.

**Does he know TypeScript?**
Yes — it is his primary language. Both the Kraftshala backend work and the
independent microservices projects are TypeScript.

**What would he walk through in a system design round?**
The alerting platform (user-supplied SQL, a validation layer, per-minute
evaluation, and the fact that another engineer later built on it) or the
food-delivery project (why event-driven rather than an orchestrated saga: a
stale order status for 200ms is acceptable, a blocked checkout is not).

**Can I see his code?**
Yes — the three independent projects are public repositories, which is
something the Kraftshala and BWS work cannot offer. Links are on this site.

**Has he ever broken production?**
Yes, and he will tell you about it before you find it. An SSO restriction he
added locked some admins out of password sign-in; he caught it and rolled it
back inside 48 hours.

**How was this site built?**
Next.js on the App Router, deployed on Vercel — one application, with the API
routes, this assistant, the contact form and a nightly digest cron all running
as serverless functions alongside the pages. MongoDB Atlas for persistence and
Gemini for the assistant. The 3D scenes are Three.js through React Three Fiber,
and the scroll animation work is GSAP.

**How do I get in touch?**
Use the contact form on this site, or the email address in the footer. For
compensation, notice or offer specifics, contact him directly — this assistant
does not discuss those.
