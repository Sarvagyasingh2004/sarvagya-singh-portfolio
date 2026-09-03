import { createHash } from "node:crypto";
import { env } from "./env";

/** Salted hash — unique-visitor counts without retaining an IP. */
export const hashIp = (ip: string) =>
  createHash("sha256").update(`${env.ipSalt}:${ip || "unknown"}`).digest("hex").slice(0, 32);

export const clientIp = (req: Request) =>
  (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";

// In-memory fixed-window limiter. Per-instance rather than global, which is
// fine here: it caps abuse from one warm instance and the Gemini free tier is
// the real backstop. A shared limiter would need Redis, which costs money.
const hits = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now > rec.reset) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (rec.n >= limit) return { ok: false, remaining: 0 };
  rec.n += 1;
  return { ok: true, remaining: limit - rec.n };
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
