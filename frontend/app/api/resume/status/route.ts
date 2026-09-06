import { existsSync } from "node:fs";
import { join } from "node:path";
import { connectDb, dbReady } from "@/lib/server/db";
import { ResumeFile } from "@/lib/server/models";
import { json } from "@/lib/server/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Has to answer the same question /api/resume answers, by the same route. It
// used to check only the local file, which does not exist on a deployment —
// the PDF is kept out of the repo so it has no crawlable URL. So this reported
// unavailable and disabled the button while the download itself was working
// perfectly from MongoDB.
export async function GET() {
  if (existsSync(join(process.cwd(), "private", "resume.pdf"))) {
    return json({ available: true });
  }

  if ((await connectDb()) && dbReady()) {
    const doc = await ResumeFile.findOne({ slug: "resume" }).select("data").lean();
    const raw = (doc as { data?: { buffer?: ArrayBufferView } } | null)?.data;
    const bytes = raw?.buffer ?? (raw as unknown as ArrayBufferView | undefined);
    if (bytes && (bytes as Uint8Array).byteLength > 0) return json({ available: true });
  }

  return json({ available: false });
}
