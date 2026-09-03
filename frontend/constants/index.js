// ---------------------------------------------------------------------------
// All content below is real and verifiable.
// Anything marked REPLACE_ME needs a value only Sarvagya has — fill these in
// before deploying. Nothing here should be invented.
// ---------------------------------------------------------------------------

const navLinks = [
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

// Every figure here is defensible under questioning.
// 12 months  = Kraftshala (Mar–Sep 2026) + BWS (Jul–Dec 2025)
// 331        = git-verified across kraftshala_api2 (202) + kfops_v2 (129)
// 100x       = dashboard query rewrite, ~40s -> ~400ms
// 3          = Food Delivery, Real-Time Chat, SaaSify-AI (all public repos)
const counterItems = [
  { value: 12, suffix: "", label: "Months in Production" },
  { value: 331, suffix: "", label: "Commits Shipped" },
  { value: 100, suffix: "x", label: "Query Optimization" },
  { value: 3, suffix: "", label: "Open-Source Systems" },
];

// Every mark here is a technology that appears on Sarvagya's resume.
// SVGs are generated from the simple-icons package, so the brand paths are
// accurate rather than hand-drawn. Regenerate with: npm run icons
const techMarquee = [
  { name: "TypeScript", imgPath: "/images/tech/typescript.svg" },
  { name: "Node.js", imgPath: "/images/tech/node-js.svg" },
  { name: "Express", imgPath: "/images/tech/express.svg" },
  { name: "React", imgPath: "/images/tech/react.svg" },
  { name: "Redux", imgPath: "/images/tech/redux.svg" },
  { name: "Next.js", imgPath: "/images/tech/next-js.svg" },
  { name: "PostgreSQL", imgPath: "/images/tech/postgresql.svg" },
  { name: "MySQL", imgPath: "/images/tech/mysql.svg" },
  { name: "MongoDB", imgPath: "/images/tech/mongodb.svg" },
  { name: "Redis", imgPath: "/images/tech/redis.svg" },
  { name: "RabbitMQ", imgPath: "/images/tech/rabbitmq.svg" },
  { name: "Docker", imgPath: "/images/tech/docker.svg" },
  { name: "Socket.IO", imgPath: "/images/tech/socket-io.svg" },
  { name: "Nginx", imgPath: "/images/tech/nginx.svg" },
  { name: "Git", imgPath: "/images/tech/git.svg" },
  { name: "GitHub Actions", imgPath: "/images/tech/github-actions.svg" },
  { name: "Linux", imgPath: "/images/tech/linux.svg" },
  { name: "Python", imgPath: "/images/tech/python.svg" },
  { name: "JavaScript", imgPath: "/images/tech/javascript.svg" },
  { name: "Tailwind CSS", imgPath: "/images/tech/tailwind-css.svg" },
  { name: "Three.js", imgPath: "/images/tech/three-js.svg" },
];

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
  {
    name: "React & Redux",
    modelPath: "/models/react_logo-transformed.glb",
    scale: 1,
    rotation: [0, 0, 0],
  },
  {
    name: "Node & Express",
    modelPath: "/models/node-transformed.glb",
    scale: 5,
    rotation: [0, -Math.PI / 2, 0],
  },
  {
    name: "Python",
    modelPath: "/models/python-transformed.glb",
    scale: 0.8,
    rotation: [0, 0, 0],
  },
  {
    name: "Three.js & WebGL",
    modelPath: "/models/three.js-transformed.glb",
    scale: 0.05,
    rotation: [0, 0, 0],
  },
  {
    name: "Git & CI/CD",
    modelPath: "/models/git-svg-transformed.glb",
    scale: 0.05,
    rotation: [0, -Math.PI / 4, 0],
  },
];

// Real roles, real dates, real scope. `summary` replaces the template's fake
// third-party "review" quote — it is a first-person statement of ownership.
const expCards = [
  {
    title: "Software Development Engineer (Full-Stack)",
    company: "Kraftshala",
    location: "Delhi, India",
    date: "March 2026 - September 2026",
    summary:
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
    title: "Full-Stack Developer",
    company: "BWS",
    location: "Remote",
    date: "July 2025 - December 2025",
    summary:
      "Built and deployed the company's website chatbot and lead-capture flow on the MERN stack, then optimized the site's performance and on-page SEO.",
    responsibilities: [
      "Built and deployed an end-to-end AI chatbot on the company website with MongoDB, Express, React and Node.js, automating responses to 100+ visitor queries.",
      "Implemented a Request a Callback flow capturing form submissions and syncing leads to Zoho CRM over REST.",
      "Cut page load time from ~8s to ~2s and lifted Lighthouse/PageSpeed scores through performance and on-page SEO work.",
      "Built a WhatsApp community integration to route users into the support channel, and maintained the production site across frontend and backend.",
    ],
  },
  {
    title: "Teaching Assistant",
    company: "Coding Blocks",
    location: "Noida, India",
    date: "May 2024 - August 2024",
    summary:
      "Mentored 100+ students through Java, data structures and algorithms via doubt sessions and one-on-one code review.",
    responsibilities: [
      "Ran doubt sessions and one-on-one code reviews for 100+ students learning Java and DSA.",
      "Debugged student code and reinforced core problem-solving patterns through structured practice.",
    ],
  },
];

// Two tracks, both first-class. `production` work shipped to real users under
// constraints someone else set; `independent` work is publicly inspectable —
// a reviewer can clone it and judge the code directly.
//
// REPLACE_ME on every entry below: repoUrl, liveUrl, and imgPath.
// The imgPath values still point at the tutorial template's screenshots —
// replace each with a real screenshot of your own running app.
const projects = [
  {
    track: "independent",
    slug: "food-delivery-microservices",
    title: "Food Delivery Microservices Platform",
    thesis: "Distributed-systems failure handling",
    desc: "Six independent services communicating over asynchronous RabbitMQ events, with real-time order and rider tracking over Socket.IO. Redis caching cut DB reads ~60% and latency ~35%; retries, a dead-letter queue and health checks handle partial failure.",
    tech: ["Node.js", "TypeScript", "RabbitMQ", "Socket.IO", "Redis", "Docker", "AWS"],
    imgPath: "/images/project1.png",
    repoUrl: "REPLACE_ME",
    liveUrl: "REPLACE_ME",
  },
  {
    track: "independent",
    slug: "realtime-chat",
    title: "Real-Time Chat Application",
    thesis: "Message delivery guarantees",
    desc: "A microservices messaging platform where RabbitMQ sits behind the WebSocket layer rather than writing straight to the database, so message acknowledgements and offline delivery survive a recipient being disconnected. Redis caching and query optimization cut response times ~35%.",
    tech: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Redis", "RabbitMQ"],
    imgPath: "/images/project2.png",
    repoUrl: "REPLACE_ME",
    liveUrl: "REPLACE_ME",
  },
  {
    track: "independent",
    slug: "saasify-ai",
    title: "SaaSify-AI",
    thesis: "Provider-agnostic LLM integration",
    desc: "A full-stack AI SaaS for content and image generation behind one adapter interface over two providers, with token authentication and REST APIs. Shipped with CI/CD and released open-source with documentation.",
    tech: ["React", "Node.js", "Express", "PostgreSQL", "OpenAI", "Claude API"],
    imgPath: "/images/project3.png",
    repoUrl: "REPLACE_ME",
    liveUrl: "REPLACE_ME",
  },
];

// REPLACE_ME — all four. Do not deploy with placeholder hrefs.
// Instagram and Facebook were dropped: they carry no signal for a dev portfolio.
const socialImgs = [
  {
    name: "GitHub",
    url: "REPLACE_ME",
    imgPath: "/images/logos/git.svg",
  },
  {
    name: "LinkedIn",
    url: "REPLACE_ME",
    imgPath: "/images/linkedin.png",
  },
  {
    name: "X",
    url: "REPLACE_ME",
    imgPath: "/images/x.png",
  },
];

const contactEmail = "sarvagya3555cc@gmail.com";


export {
  words,
  abilities,
  techMarquee,
  counterItems,
  expCards,
  projects,
  socialImgs,
  contactEmail,
  techStackIcons,
  navLinks,
};
