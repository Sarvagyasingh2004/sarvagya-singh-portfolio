# Independent projects (all public repositories)

These are separate from professional work. A reviewer can clone them and read
the code directly, which is something the Kraftshala and BWS work cannot offer.

## Food Delivery Microservices Platform
Node.js, TypeScript, RabbitMQ, Socket.IO, Redis, Docker, AWS

Six independent microservices communicating over asynchronous RabbitMQ events,
with real-time order and rider tracking over Socket.IO. Redis caching reduced
database reads by around 60% and latency by around 35%. Includes 100 req/min
rate limiting, retry policies, dead-letter-queue handling and health checks.

The design decision worth discussing: event-driven rather than an orchestrated
saga. A stale order status for 200ms is acceptable; a blocked checkout is not.

## Real-Time Chat Application
Next.js, TypeScript, Node.js, MongoDB, Redis, RabbitMQ

A microservices messaging platform with WebSocket communication and
RabbitMQ-driven asynchronous processing. RabbitMQ sits behind the WebSocket
layer rather than the socket writing straight to the database, which is what
makes message acknowledgements and offline delivery work when a recipient is
disconnected. Redis caching and query optimization cut response times ~35%.
JWT authentication.

## SaaSify-AI
React, Node.js, Express, PostgreSQL, OpenAI, Claude API

A full-stack AI SaaS for content and image generation, integrating two LLM
providers behind one adapter interface, with secure token authentication and
REST APIs. Shipped with CI/CD and released open-source with documentation.

Counting this portfolio's Gemini integration, that is three LLM providers behind
the same abstraction pattern.
