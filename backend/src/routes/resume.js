import { Router } from "express";
import { z } from "zod";
import { writeLimiter } from "../middleware/limits.js";
import { featureFlags } from "../lib/config.js";
import { isDbConnected } from "../lib/db.js";
import { ResumeGrant } from "../models/index.js";
import { hashIp } from "../lib/hash.js";

const router = Router();

const schema = z.object({
  role: z.enum(["backend", "fullstack"]).default("backend"),
  scope: z.enum(["india", "remote"]).default("remote"),
});

router.get("/", writeLimiter, async (req, res) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Unknown resume variant." });

  const { role, scope } = parsed.data;

  if (isDbConnected()) {
    await ResumeGrant.create({
      role,
      scope,
      ipHash: hashIp(req.ip),
      referrer: req.get("referer") || "",
    }).catch(() => {});
  }

  if (!featureFlags.resume) {
    return res.status(503).json({
      error: "Resume delivery is not configured yet (RESUME_BUCKET unset).",
      wouldServe: `resumes/${role}-${scope}-v1.pdf`,
    });
  }

  // Presigned URL generation goes here once the bucket exists:
  //   new GetObjectCommand({ Bucket, Key }) + getSignedUrl({ expiresIn: 300 })
  // then res.redirect(302, url).
  res.status(501).json({ error: "Not implemented yet." });
});

export default router;
