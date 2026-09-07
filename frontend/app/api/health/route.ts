import { flags, env } from "@/lib/server/env";
import { connectDb, dbReady } from "@/lib/server/db";
import { json } from "@/lib/server/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDb();
  return json({
    ok: true,
    features: {
      ...flags,
      dbConnected: dbReady(),
      // Whether the function can actually see the key, which is the first thing
      // to check when mailbox verification appears to do nothing: Vercel only
      // applies a new environment variable on the next deployment.
      mailboxVerify: Boolean(process.env.EMAIL_VERIFY_API_KEY),
    },
    model: flags.chat ? env.geminiModel : null,
  });
}
