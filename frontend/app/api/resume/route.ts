import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { connectDb, dbReady } from "@/lib/server/db";
import { ResumeGrant, ResumeFile } from "@/lib/server/models";
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

  // Local file first, so development works straight from private/resume.pdf.
  // In production that file does not exist - it is deliberately not in the
  // repository, which is public and the PDF carries a phone number - so the
  // copy stored in Mongo is served instead. Upload it with `npm run resume:push`.
  let pdf: Buffer | null = null;
  if (existsSync(FILE)) {
    pdf = await readFile(FILE);
  } else if ((await connectDb()) && dbReady()) {
    const doc = await ResumeFile.findOne({ slug: "resume" });
    // A Buffer field comes back as MongoDB's Binary wrapper, not a Node
    // Buffer. Buffer.from() on that yields ZERO bytes without throwing, so
    // the route answered 200 with a valid content-type and an empty file -
    // a download button that appears to work and delivers nothing. Read the
    // wrapper's own buffer, falling back for a plain Buffer.
    const raw = doc?.data as unknown as { buffer?: ArrayBufferView } | undefined;
    const bytes = raw?.buffer ?? (raw as unknown as ArrayBufferView | undefined);
    if (bytes) pdf = Buffer.from(bytes as unknown as Uint8Array);
  }

  // Never answer 200 with an empty body: an empty PDF looks like a working
  // download until the visitor opens it.
  if (pdf && pdf.length === 0) pdf = null;

  if (!pdf) {
    return json({ error: "Resume not available." }, 404);
  }

  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="sarvagya-singh-resume.pdf"',
      "cache-control": "private, no-store",
    },
  });
}
