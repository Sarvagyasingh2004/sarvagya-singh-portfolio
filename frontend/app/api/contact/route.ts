import { promises as dns } from "node:dns";
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

const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "throwawaymail.com", "yopmail.com", "trashmail.com",
  "sharklasers.com", "getnada.com", "dispostable.com", "maildrop.cc",
]);

// The near-misses that actually get typed, rather than an exhaustive list.
const TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmail.co": "gmail.com",
  "gmailc.om": "gmail.com", "gnail.com": "gmail.com", "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com",
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com", "outlook.co": "outlook.com",
};

type MailCheck = { ok: true } | { ok: false; error: string };

/**
 * Mailbox-level check, when a key is configured.
 *
 * An MX lookup only proves the domain accepts mail. Proving a specific mailbox
 * exists means an SMTP RCPT TO probe, and that cannot be done from here:
 * Vercel's functions have no outbound port 25, most large providers answer 250
 * for every address anyway, and probing gets the source IP blacklisted. A
 * verification service does it from infrastructure built for it.
 *
 * Only a definite UNDELIVERABLE is rejected. Catch-all domains, rate limits and
 * outages all come back UNKNOWN, and turning a real visitor away on an unknown
 * is worse than accepting a bad address.
 */
async function verifyMailbox(email: string): Promise<MailCheck> {
  const key = process.env.EMAIL_VERIFY_API_KEY;
  if (!key) return { ok: true };

  try {
    const url =
      "https://emailvalidation.abstractapi.com/v1/?api_key=" +
      encodeURIComponent(key) +
      "&email=" +
      encodeURIComponent(email);
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return { ok: true };

    const data = (await res.json()) as {
      deliverability?: string;
      is_smtp_valid?: { value?: boolean };
    };
    const undeliverable = data.deliverability === "UNDELIVERABLE";
    const noMailbox = data.is_smtp_valid?.value === false;
    if (undeliverable || noMailbox) {
      return {
        ok: false,
        error: "That mailbox does not exist. Please check the address.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

async function checkMailDomain(email: string): Promise<MailCheck> {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) return { ok: false, error: "Please enter a valid email address." };

  if (TYPOS[domain]) {
    return { ok: false, error: `Did you mean @${TYPOS[domain]}? Please check the address.` };
  }
  if (DISPOSABLE.has(domain)) {
    return { ok: false, error: "Please use an address you can be reached at." };
  }

  try {
    const mx = await dns.resolveMx(domain);
    if (!mx.length || mx.every((r) => !r.exchange)) {
      return { ok: false, error: "That email domain does not accept mail. Please check the address." };
    }
    return { ok: true };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    // NXDOMAIN / no records: the domain genuinely cannot receive mail.
    if (code === "ENOTFOUND" || code === "NXDOMAIN" || code === "ENODATA") {
      return { ok: false, error: "That email domain does not exist. Please check the address." };
    }
    // Anything else is our problem — a timeout, a resolver hiccup — so let it through.
    return { ok: true };
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000).ok) {
    return json({ error: "Too many submissions. Please try again later." }, 429);
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Please check the form and try again." }, 400);

  const { name, email, message, company_url } = parsed.data;
  if (company_url) return new Response(null, { status: 204 });

  const mail = await checkMailDomain(email);
  if (!mail.ok) return json({ error: mail.error }, 400);

  const mailbox = await verifyMailbox(email);
  if (!mailbox.ok) return json({ error: mailbox.error }, 400);

  if ((await connectDb()) && dbReady()) {
    await Contact.create({ name, email, message, ipHash: hashIp(ip) }).catch(() => {});
  }

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
