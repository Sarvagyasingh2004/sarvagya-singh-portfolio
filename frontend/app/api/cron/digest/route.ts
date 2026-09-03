import { Resend } from "resend";
import { env, flags } from "@/lib/server/env";
import { connectDb, dbReady } from "@/lib/server/db";
import { ChatMessage, Contact, Event, ResumeGrant } from "@/lib/server/models";
import { json } from "@/lib/server/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Vercel Cron sends this header; the secret stops anyone else hitting it.
  const auth = req.headers.get("authorization");
  if (env.cronSecret && auth !== `Bearer ${env.cronSecret}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (!(await connectDb()) || !dbReady()) {
    return json({ error: "No database configured — nothing to report." }, 503);
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [questions, lowConf, contacts, resumes, events] = await Promise.all([
    ChatMessage.find({ role: "user", createdAt: { $gte: since } }).lean(),
    ChatMessage.find({ role: "model", lowConfidence: true, createdAt: { $gte: since } }).lean(),
    Contact.find({ createdAt: { $gte: since } }).lean(),
    ResumeGrant.find({ createdAt: { $gte: since } }).lean(),
    Event.find({ createdAt: { $gte: since } }).lean(),
  ]);

  const uniqueVisitors = new Set(events.map((e) => e.ipHash)).size;
  const topPaths = Object.entries(
    events.reduce<Record<string, number>>((a, e) => {
      if (e.path) a[e.path] = (a[e.path] ?? 0) + 1;
      return a;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const lines = [
    `Portfolio digest — last 24h`,
    ``,
    `Unique visitors: ${uniqueVisitors}`,
    `Resume downloads: ${resumes.length}`,
    `Chatbot questions: ${questions.length}`,
    ``,
    `## Contact submissions (${contacts.length})`,
    ...contacts.map((c) => `  ${c.name} <${c.email}>\n    ${String(c.message).slice(0, 300)}`),
    ``,
    `## Questions asked`,
    ...questions.map((q) => `  - ${String(q.text).slice(0, 200)}`),
    ``,
    `## !! The corpus could not answer these (${lowConf.length})`,
    `   Each one is a gap worth filling in knowledge/.`,
    ...lowConf.map((m) => `  - ${String(m.text).slice(0, 200)}`),
    ``,
    `## Top paths`,
    ...topPaths.map(([p, n]) => `  ${p}: ${n}`),
  ];

  const body = lines.join("\n");

  if (!flags.email) {
    // Still return the report so a manual run is useful before Resend is set.
    return json({ ok: true, emailed: false, report: body });
  }

  await new Resend(env.resendKey).emails.send({
    from: env.fromEmail,
    to: env.notifyEmail,
    subject: `Portfolio digest — ${uniqueVisitors} visitors, ${contacts.length} messages`,
    text: body,
  });

  return json({ ok: true, emailed: true, visitors: uniqueVisitors });
}
