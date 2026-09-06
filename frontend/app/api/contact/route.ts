import net from "node:net";
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
/**
 * Asks the recipient's own mail server whether the mailbox exists, by getting
 * as far as RCPT TO and stopping before anything is sent.
 *
 * Measured against the real world rather than assumed: Gmail, iCloud, Zoho and
 * ordinary custom domains all answer 550 for an address that does not exist,
 * which is a definite answer worth acting on. Outlook, Hotmail and Yahoo close
 * the connection on anyone without mail-server reputation, and Proton does not
 * answer at all — those are not refusals, they are silence, and silence is
 * treated as acceptance.
 *
 * Fails open on everything except an explicit rejection. A blocked port, a
 * greylist, a catch-all domain and a timeout all let the message through: a
 * real person turned away is a worse outcome than an undeliverable address.
 *
 * Note for deployment: this needs outbound port 25, which most serverless
 * platforms (Vercel included, via Lambda) do not allow. There it will time out
 * and fail open, and EMAIL_VERIFY_API_KEY below is what does the work instead.
 */
const REJECTED = new Set(["550", "551", "553"]);

function smtpProbe(email: string, host: string, ms = 4000): Promise<string> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (code: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { socket.destroy(); } catch { /* already gone */ }
      resolve(code);
    };
    const timer = setTimeout(() => finish("timeout"), ms);

    const steps = [
      "EHLO mail.sarvagyasingh.space",
      "MAIL FROM:<postmaster@sarvagyasingh.space>",
      `RCPT TO:<${email}>`,
      "QUIT",
    ];
    let stage = 0;
    let awaitingRcpt = false;
    let buffer = "";

    const socket = net.createConnection({ host, port: 25 });
    socket.setTimeout(ms);
    socket.on("timeout", () => finish("timeout"));
    socket.on("error", () => finish("unreachable"));
    socket.on("close", () => finish("closed"));
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] ?? "";
      // A hyphen after the code means more lines are coming.
      if (/^\d{3}-/.test(last)) return;
      buffer = "";
      if (awaitingRcpt) return finish(last.slice(0, 3));
      if (stage < steps.length) {
        if (stage === 2) awaitingRcpt = true;
        socket.write(steps[stage] + "\r\n");
        stage += 1;
      }
    });
  });
}

async function mailboxExists(email: string): Promise<MailCheck> {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  let host = "";
  try {
    const mx = (await dns.resolveMx(domain)).sort((a, b) => a.priority - b.priority);
    host = mx[0]?.exchange ?? "";
  } catch {
    return { ok: true };
  }
  if (!host) return { ok: true };

  const code = await smtpProbe(email, host);
  if (REJECTED.has(code)) {
    return {
      ok: false,
      error: "That mailbox does not exist at that domain. Please check the address.",
    };
  }
  return { ok: true };
}

async function verifyMailbox(email: string): Promise<MailCheck> {
  const key = process.env.EMAIL_VERIFY_API_KEY;
  // Without a key, ask the mail server directly. It answers definitively for a
  // good share of real addresses and costs nothing.
  if (!key) return mailboxExists(email);

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
