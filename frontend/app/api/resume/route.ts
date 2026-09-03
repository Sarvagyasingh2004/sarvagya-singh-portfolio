import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { connectDb, dbReady } from "@/lib/server/db";
import { ResumeGrant } from "@/lib/server/models";
import { clientIp, hashIp, json, rateLimit } from "@/lib/server/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Outside public/, so there is no crawlable URL and the phone number on the
// PDF is never scraped off a static path. Served only through this route.
const FILE = join(process.cwd(), "private", "resume.pdf");

export async function GET(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`resume:${ip}`, 10, 60 * 60 * 1000).ok) {
    return json({ error: "Too many requests." }, 429);
  }

  // Track before serving — how many recruiters pull the resume is the most
  // useful figure in the digest.
  if ((await connectDb()) && dbReady()) {
    ResumeGrant.create({
      ipHash: hashIp(ip),
      referrer: req.headers.get("referer") ?? "",
    }).catch(() => {});
  }

  if (!existsSync(FILE)) {
    return json({ error: "Resume not available." }, 404);
  }

  const pdf = await readFile(FILE);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="sarvagya-singh-resume.pdf"',
      "cache-control": "private, no-store",
    },
  });
}
