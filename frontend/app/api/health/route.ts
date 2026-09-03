import { flags, env } from "@/lib/server/env";
import { connectDb, dbReady } from "@/lib/server/db";
import { json } from "@/lib/server/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDb();
  return json({
    ok: true,
    features: { ...flags, dbConnected: dbReady() },
    model: flags.chat ? env.geminiModel : null,
  });
}
