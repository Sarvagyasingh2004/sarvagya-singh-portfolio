// Nightly visitor-activity digest. Run via a systemd timer in production:
//   npm run digest
import { connectDb, isDbConnected } from "../lib/db.js";
import { ChatMessage, Event, Contact, ResumeGrant } from "../models/index.js";
import { featureFlags } from "../lib/config.js";

const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

const build = async () => {
  const [questions, lowConf, contacts, resumes, events] = await Promise.all([
    ChatMessage.find({ role: "user", createdAt: { $gte: since } }).lean(),
    ChatMessage.find({ role: "model", lowConfidence: true, createdAt: { $gte: since } }).lean(),
    Contact.find({ createdAt: { $gte: since } }).lean(),
    ResumeGrant.find({ createdAt: { $gte: since } }).lean(),
    Event.find({ createdAt: { $gte: since } }).lean(),
  ]);

  const lines = [
    `Portfolio digest — last 24h`,
    ``,
    `## Contact submissions (${contacts.length})`,
    ...contacts.map((c) => `  ${c.name} <${c.email}>\n    ${c.message.slice(0, 300)}`),
    ``,
    `## Resume downloads: ${resumes.length}`,
    ``,
    `## Chatbot questions (${questions.length})`,
    ...questions.map((q) => `  - ${q.text.slice(0, 200)}`),
    ``,
    `## !! Answers the corpus could not cover (${lowConf.length})`,
    `   These are gaps worth filling in knowledge/.`,
    ...lowConf.map((m) => `  - ${m.text.slice(0, 200)}`),
    ``,
    `## Events (${events.length})`,
    `  unique visitors: ${new Set(events.map((e) => e.ipHash)).size}`,
  ];

  return lines.join("\n");
};

const main = async () => {
  await connectDb();
  if (!isDbConnected()) {
    console.error("digest: no database connection, nothing to report");
    process.exit(1);
  }

  const body = await build();

  if (!featureFlags.email) {
    console.log("--- digest (SES not configured, printing instead) ---\n");
    console.log(body);
  } else {
    // SES send goes here once SES_FROM / NOTIFY_EMAIL are set.
    console.log("digest: SES delivery not yet wired");
  }

  process.exit(0);
};

main();
