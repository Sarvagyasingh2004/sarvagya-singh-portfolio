# Technical skills

Listed with where each was actually used, because a bare keyword list tells a
reviewer nothing. If a technology is not named here, he has not shipped with it
and the assistant should say so rather than guess.

**Languages** — TypeScript (primary; the Kraftshala backend and both
microservices projects), JavaScript ES6+, Python, Java (the language he taught
as a TA), SQL.

**Backend** — Node.js and Express; REST API design; JWT; Google OAuth 2.0
implemented end to end at Kraftshala, keyed on the immutable Google subject ID
so accounts survive a Workspace email rename; microservices; WebSockets and
Socket.IO for live order and rider tracking.

**Databases** — MySQL and MariaDB (Kraftshala), PostgreSQL (SaaSify-AI),
MongoDB (BWS chatbot, Real-Time Chat), Redis (caching in both microservices
projects). Query optimization is the strongest single area: the deferred-join
rewrite that took a dashboard from ~40s to ~400ms, and a listing query
rewritten from six correlated subqueries to one pre-aggregated join.

**Queues and async** — RabbitMQ (event backbone across six services in the
food-delivery project, and behind the WebSocket layer in the chat app so
acknowledgements and offline delivery work), Bull (asynchronous processing of
1,000+ row Excel uploads), cron-driven evaluation for the alerting platform.

**Cloud and DevOps** — Docker; AWS EC2, S3, CloudFront and SES; CI/CD with
GitHub Actions; Git; Linux; Nginx; Postman.

**Frontend** — React and Redux (a production internal operations platform, not
a toy), Next.js, Material-UI, Tailwind, HTML5/CSS3, Three.js and React Three
Fiber (this site's 3D scenes).

**AI / LLM integration** — Gemini (this site's assistant), OpenAI and Claude
(SaaSify-AI). Three providers behind one adapter interface, so adding or
swapping a model is a configuration change rather than a rewrite.

**Architecture and practice** — event-driven design, caching strategy, rate
limiting, feature flags for staged rollout, audit logging, Agile/Scrum.
