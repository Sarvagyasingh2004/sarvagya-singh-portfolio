import { z } from "zod";
import { Resend } from "resend";
import { env, flags } from "@/lib/server/env";
import { connectDb, dbReady } from "@/lib/server/db";
import { Contact } from "@/lib/server/models";
import { clientIp, hashIp, json, rateLimit } from "@/lib/server/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
  // Honeypot: bots fill hidden fields, people don't.
  company_url: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000).ok) {
    return json({ error: "Too many submissions. Please try again later." }, 429);
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Please check the form and try again." }, 400);

  const { name, email, message, company_url } = parsed.data;
  if (company_url) return new Response(null, { status: 204 });

  if ((await connectDb()) && dbReady()) {
    await Contact.create({ name, email, message, ipHash: hashIp(ip) }).catch(() => {});
  }

  // Contact is high intent — alert immediately rather than waiting for the
  // nightly digest.
  if (flags.email) {
    try {
      await new Resend(env.resendKey).emails.send({
        from: env.fromEmail,
        to: env.notifyEmail,
        replyTo: email,
        subject: `Portfolio contact: ${name}`,
        text: `${name} <${email}>\n\n${message}`,
      });
    } catch (e) {
      console.error("[contact] email", (e as Error).message);
    }
  }

  return json({ ok: true });
}
