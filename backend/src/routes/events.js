import { Router } from "express";
import { z } from "zod";
import { beaconLimiter } from "../middleware/limits.js";
import { isDbConnected } from "../lib/db.js";
import { Event } from "../models/index.js";
import { hashIp } from "../lib/hash.js";

const router = Router();

const schema = z.object({
  type: z.string().trim().min(1).max(60),
  path: z.string().trim().max(300).optional(),
  sessionId: z.string().trim().max(64).optional(),
  meta: z.record(z.unknown()).optional(),
});

router.post("/", beaconLimiter, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(204).end();

  if (isDbConnected()) {
    await Event.create({
      ...parsed.data,
      ipHash: hashIp(req.ip),
      referrer: req.get("referer") || "",
    }).catch(() => {});
  }

  // Beacons never need a body back.
  res.status(204).end();
});

export default router;
