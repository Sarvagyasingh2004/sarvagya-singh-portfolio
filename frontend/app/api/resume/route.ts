import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { connectDb, dbReady } from "@/lib/server/db";
import { ResumeGrant, ResumeFile } from "@/lib/server/models";
import { clientIp, hashIp, json, rateLimit } from "@/lib/server/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE = join(process.cwd(), "private", "resume.pdf");

export async function GET(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`resume:${ip}`, 10, 60 * 60 * 1000).ok) {
    return json({ error: "Too many requests." }, 429);
  }

  if ((await connectDb()) && dbReady()) {
    ResumeGrant.create({
      ipHash: hashIp(ip),
      referrer: req.headers.get("referer") ?? "",
    }).catch(() => {});
  }

  let pdf: Buffer | null = null;
  if (existsSync(FILE)) {
    pdf = await readFile(FILE);
  } else if ((await connectDb()) && dbReady()) {
    const doc = await ResumeFile.findOne({ slug: "resume" });
    const raw = doc?.data as unknown as { buffer?: ArrayBufferView } | undefined;
    const bytes = raw?.buffer ?? (raw as unknown as ArrayBufferView | undefined);
    if (bytes) pdf = Buffer.from(bytes as unknown as Uint8Array);
  }

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
