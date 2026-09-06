import techIcons from "./tech-icons.js";

const navLinks = [
  {
    name: "About",
    link: "#about",
  },
  {
    name: "Work",
    link: "#work",
  },
  {
    name: "Experience",
    link: "#experience",
  },
  {
    name: "Skills",
    link: "#skills",
  },
  {
    name: "Contact",
    link: "#contact",
  },
];

const words = [
  { text: "Ideas", imgPath: "/images/ideas.svg" },
  { text: "Concepts", imgPath: "/images/concepts.svg" },
  { text: "Designs", imgPath: "/images/designs.svg" },
  { text: "Code", imgPath: "/images/code.svg" },
  { text: "Ideas", imgPath: "/images/ideas.svg" },
  { text: "Concepts", imgPath: "/images/concepts.svg" },
  { text: "Designs", imgPath: "/images/designs.svg" },
  { text: "Code", imgPath: "/images/code.svg" },
];

const counterItems = [
  {
    before: "~40s",
    after: "~400ms",
    label: "Dashboard queries, rebuilt around a deferred join",
    where: "Kraftshala",
    icon: "/images/tech/mysql.svg",
    tech: "MySQL",
  },
  {
    before: "2K/day",
    after: "400K/day",
    label: "Calendar invite ceiling, once sending was decoupled from event creation",
    where: "Kraftshala",
    icon: "/images/tech/node-js.svg",
    tech: "Node.js",
  },
  {
    before: "6 subqueries",
    after: "1 join",
    label: "Listing query, pre-aggregated instead of correlated",
    where: "Kraftshala",
    icon: "/images/tech/postgresql.svg",
    tech: "SQL",
  },
  {
    before: "~8s",
    after: "~2s",
    label: "Page load on a production site, with the SEO work that went with it",
    where: "BWS",
    icon: "/images/tech/react.svg",
    tech: "React",
  },
];

const logoIconsList = techIcons;

const abilities = [
  {
    imgPath: "/images/seo.png",
    title: "Ships to Production",
    desc: "331 commits across two live codebases in six months. Features owned end-to-end, from migration to admin UI.",
  },
  {
    imgPath: "/images/chat.png",
    title: "Optimizes What's Slow",
    desc: "Rewrote a dashboard query from ~40s to ~400ms with a deferred-join pattern, and fixed the pagination counts it had been inflating.",
  },
  {
    imgPath: "/images/time.png",
    title: "Owns the Incident",
    desc: "Broke admin password sign-in with an SSO restriction, caught it, and rolled it back inside 48 hours.",
  },
];

const techStackIcons = [
  { name: "TypeScript", modelPath: "/models/typescript-extruded.glb", scale: 3, rotation: [0, 0, 0] },
  { name: "React & Redux", modelPath: "/models/react_logo-transformed.glb", scale: 1, rotation: [0, 0, 0] },
  { name: "Node.js", modelPath: "/models/nodejs-extruded.glb", scale: 3, rotation: [0, 0, 0] },
  { name: "Express", modelPath: "/models/express-extruded.glb", scale: 3, rotation: [0, 0, 0] },
  { name: "MongoDB", modelPath: "/models/mongodb-extruded.glb", scale: 3, rotation: [0, 0, 0] },
  { name: "PostgreSQL", modelPath: "/models/postgresql-extruded.glb", scale: 3, rotation: [0, 0, 0] },
  { name: "Redis", modelPath: "/models/redis-extruded.glb", scale: 3, rotation: [0, 0, 0] },
  { name: "RabbitMQ", modelPath: "/models/rabbitmq-extruded.glb", scale: 3, rotation: [0, 0, 0] },
];

const expCards = [
  {
    title: "Software Development Engineer (Full-Stack) — Kraftshala",
    date: "March 2026 - September 2026",
    company: "Kraftshala",
    logoPath: "/images/companies/kraftshala.jpg",
    review:
      "Owned features end-to-end across a Node/TypeScript/MySQL backend and a React/Redux internal ops platform. 331 commits across both repositories.",
    responsibilities: [
      "Built a self-service Google Chat alerting platform: teams define SQL rules and thresholds via API, a per-minute cron evaluates them, and a validation layer restricts queries to SELECT/WITH and blocks DDL/DML. Another engineer later shipped two of their own alert features on top of it.",
      "Re-architected data-heavy dashboard queries with a deferred-join pattern, cutting load from ~40s to ~400ms and eliminating inflated pagination counts.",
      "Engineered a bulk Excel ingestion pipeline handling 1,000+ records per upload across three booking modes, with pre-write validation for duplicates, timing overlaps and expert availability, processed asynchronously through a Bull queue.",
      "Implemented Google OAuth 2.0 SSO end-to-end, keying accounts on the immutable Google subject ID so they survive Workspace email renames.",
      "Shipped a Placements Opportunity Tracker: a reusable before/after audit-log module, transactional owner reassignment, and a listing-query rewrite from 6 correlated subqueries to 1 pre-aggregated join.",
      "Re-architected calendar-invite delivery to decouple event creation from email sending via AWS SES, shipped behind default-off feature flags for staged rollout with instant rollback.",
    ],
  },
  {
    title: "Full-Stack Developer — BWS",
    date: "July 2025 - December 2025",
    company: "BWS",
    logoPath: "/images/companies/bws.jpg",
    review:
      "Built and deployed the company's website chatbot and lead-capture flow on the MERN stack, then optimized the site's performance and on-page SEO.",
    responsibilities: [
      "Built and deployed an end-to-end AI chatbot on the company website with MongoDB, Express, React and Node.js, automating responses to 100+ visitor queries.",
      "Implemented a Request a Callback flow capturing form submissions and syncing leads to Zoho CRM over REST.",
      "Cut page load time from ~8s to ~2s and lifted Lighthouse/PageSpeed scores through performance and on-page SEO work.",
      "Built a WhatsApp community integration to route users into the support channel, and maintained the production site across frontend and backend.",
    ],
  },
  {
    title: "Teaching Assistant — Coding Blocks",
    date: "May 2024 - August 2024",
    company: "Coding Blocks",
    logoPath: "/images/companies/coding-blocks.jpg",
    review:
      "Mentored 100+ students through Java, data structures and algorithms via doubt sessions and one-on-one code review.",
    responsibilities: [
      "Ran doubt sessions and one-on-one code reviews for 100+ students learning Java and DSA.",
      "Debugged student code and reinforced core problem-solving patterns through structured practice.",
    ],
  },
];

const projects = [
  {
    slug: "kraftshala-convex",
    title: "Convex — Kraftshala Internal Platform",
    tagline:
      "Six months owning features on the internal platform a real team used daily.",
    stack: ["Node.js", "TypeScript", "MySQL", "React"],
    highlights: [
      "Self-service alerting on user-defined SQL rules. Another engineer later shipped two features on it unaided.",
      "Dashboard queries rebuilt around a deferred join — ~40s to ~400ms, and the inflated pagination counts with it.",
      "Bulk Excel ingestion: 1,000+ rows an upload, validated before any write, through a Bull queue.",
    ],
    // No repoUrl: this shipped inside a company.
    note: "Kraftshala production work — proprietary code. More in Experience.",
    shot: "/images/projects/kraftshala-convex.jpg",
    accent: "amber",
  },
  {
    slug: "food-delivery-microservices",
    title: "Eatlify — Food Delivery Microservices",
    tagline:
      "Six independent services coordinating one order, built so any of them can fail without taking the order with it.",
    stack: ["Node.js", "TypeScript", "RabbitMQ", "Socket.IO", "Redis", "Docker", "AWS"],
    highlights: [
      "Six services communicating over asynchronous RabbitMQ events, with live order and rider tracking on Socket.IO.",
      "Redis caching cut database reads by roughly 60% and latency by roughly 35%.",
      "Retries, a dead-letter queue and health checks so a downed service degrades instead of losing orders.",
    ],
    repoUrl: "https://github.com/Sarvagyasingh2004/eatlify-food-ordering-microservices",
    shot: "/images/projects/eatlify.png",
    accent: "violet",
  },
  {
    slug: "skein",
    title: "Skein — Real-Time Chat",
    tagline:
      "A messaging platform where a message survives the recipient being offline — passwordless sign-in, delivery state you can trust.",
    stack: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Redis", "RabbitMQ"],
    highlights: [
      "RabbitMQ sits behind the WebSocket layer rather than the socket writing straight to the database — which is what makes acknowledgements and offline delivery work.",
      "Redis caching and query optimization cut response times by roughly 35%.",
      "JWT authentication with per-message delivery state, so the UI can show sent, delivered and read honestly.",
    ],
    repos: [
      { label: "Frontend code", url: "https://github.com/Sarvagyasingh2004/Skein-frontend" },
      { label: "Backend code", url: "https://github.com/Sarvagyasingh2004/Skein-backend" },
    ],
    shot: "/images/projects/skein.jpg",
    accent: "indigo",
  },
  {
    slug: "saasify-ai",
    title: "SaaSify-AI",
    tagline:
      "Content and image generation across two LLM providers behind a single adapter.",
    stack: ["React", "Node.js", "Express", "PostgreSQL", "OpenAI", "Claude API"],
    highlights: [
      "Two providers behind one interface, so swapping or adding a model is a config change rather than a rewrite.",
      "Token-based authentication and REST APIs, shipped with CI/CD.",
      "Released open-source with documentation — counting this site's Gemini integration, that is three providers on the same abstraction.",
    ],
    repoUrl: "https://github.com/Sarvagyasingh2004/SaaSify-AI",
    shot: "/images/projects/saasify-ai.jpg",
    accent: "cyan",
  },
];

const about = {
  eyebrow: "About",
  heading: "I own the whole path — API to screen.",
  paragraphs: [
    "I'm a software engineer in Delhi NCR working across backend and full-stack — Node.js, TypeScript, Express, React/Redux and SQL, with Redis and RabbitMQ where the work needs them. I graduate from MAIT (GGSIPU) in May 2026 with a 9.2 CGPA, though most of what I know came from shipping: 331 commits across two live codebases.",
    "At Kraftshala I owned features end to end on the platform a team used daily — dashboard queries from ~40s to ~400ms, a self-service alerting platform where teams write their own SQL rules, bulk Excel ingestion at 1,000+ records an upload, Google OAuth SSO, and calendar invites re-architected through AWS SES from around 2,000 a day to 400,000. The alerting platform is the one I would walk you through: months later another engineer shipped two of their own features on top of it, without needing me.",
    "Before that I built a MERN AI chatbot and a Zoho CRM lead sync at BWS, and mentored 100+ students in Java and DSA at Coding Blocks. On my own time: a six-service delivery platform on RabbitMQ, a real-time chat system with offline delivery, and an AI SaaS on two LLM providers. I also broke production once — an SSO change locked some admins out of password sign-in, and I caught it and rolled it back inside 48 hours.",
  ],
  facts: [
    { k: "Based in", v: "Delhi NCR, India — open to remote, globally" },
    { k: "Education", v: "B.Tech CSE, MAIT — 9.2 CGPA, Top 25 GGSIPU" },
    { k: "Works in", v: "Node, TypeScript, React, SQL, Redis, RabbitMQ, Docker" },
    { k: "Currently", v: "Open to backend and full-stack roles" },
  ],
};

const now = {
  updated: "September 2026",
  status: "available",
  headline: "Looking for a full-time backend or full-stack role.",
  items: [
    "Open to Delhi NCR, hybrid, or fully remote — including international remote.",
    "Available to start immediately; my engagement at Kraftshala concluded in September 2026.",
    "Currently deepening DSA and system design, and writing up the systems on this site as case studies.",
  ],
};

const socialImgs = [
  {
    name: "GitHub",
    url: "https://github.com/Sarvagyasingh2004",

    imgPath: "/images/logos/github.svg",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/sarvagya-singh-1015722a4",
    imgPath: "/images/linkedin.png",
  },
  {
    name: "LeetCode",
    url: "https://leetcode.com/u/Sarvagyasingh_2004/",
    imgPath: "/images/logos/leetcode.svg",
  },
  {
    name: "Email",
    url: "#contact",
    imgPath: "/images/logos/email.svg",
  },
];

const contactEmail = "sarvagya3555cc@gmail.com";

export {
  words,
  abilities,
  logoIconsList,
  counterItems,
  expCards,
  projects,
  socialImgs,
  about,
  now,
  contactEmail,
  techStackIcons,
  navLinks,
};
