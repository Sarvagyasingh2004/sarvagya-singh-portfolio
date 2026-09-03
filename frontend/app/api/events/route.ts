import { z } from "zod";
import { connectDb, dbReady } from "@/lib/server/db";
import { Event } from "@/lib/server/models";
import { clientIp, hashIp, rateLimit } from "@/lib/server/util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  type: z.string().trim().min(1).max(60),
  path: z.string().trim().max(300).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  // Beacons always answer 204 — a analytics failure must be invisible.
  if (!rateLimit(`ev:${ip}`, 120, 60 * 1000).ok) return new Response(null, { status: 204 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (parsed.success && (await connectDb()) && dbReady()) {
    await Event.create({
      ...parsed.data,
      ipHash: hashIp(ip),
      referrer: req.headers.get("referer") ?? "",
    }).catch(() => {});
  }
  return new Response(null, { status: 204 });
}
