import { Router } from "express";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { writeLimiter } from "../middleware/limits.js";
import { config, featureFlags } from "../lib/config.js";
import { isDbConnected } from "../lib/db.js";
import { ResumeGrant } from "../models/index.js";
import { hashIp } from "../lib/hash.js";

const router = Router();
const here = dirname(fileURLToPath(import.meta.url));
const resumeDir = join(here, "..", "..", "resumes");

const querySchema = z.object({
  role: z.enum(["backend", "fullstack", "frontend"]).default("backend"),
  scope: z.enum(["india", "remote"]).default("remote"),
  // ?download=1 forces a save dialog instead of opening in the viewer.
  download: z.enum(["0", "1"]).optional(),
});

const fileFor = ({ role, scope }) => `sarvagya-singh-${role}-${scope}.pdf`;

// GET /api/resume/variants — lets the UI show only variants that exist.
router.get("/variants", (req, res) => {
  const variants = [];
  for (const role of ["backend", "fullstack", "frontend"]) {
    for (const scope of ["india", "remote"]) {
      const file = fileFor({ role, scope });
      variants.push({
        role,
        scope,
        file,
        available: featureFlags.resume || existsSync(join(resumeDir, file)),
      });
    }
  }
  res.json({ source: featureFlags.resume ? "s3" : "local", variants });
});

router.get("/", writeLimiter, async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Unknown resume variant." });
  }

  const { role, scope, download } = parsed.data;
  const file = fileFor({ role, scope });

  // Track the request before serving — which of the four variants recruiters
  // actually pull is real signal about where to aim applications.
  if (isDbConnected()) {
    ResumeGrant.create({
      role,
      scope,
      ipHash: hashIp(req.ip),
      referrer: req.get("referer") || "",
    }).catch(() => {});
  }

  // Production: hand back a short-lived presigned S3 URL so the bucket stays
  // private and the PDF is never publicly crawlable.
  if (featureFlags.resume) {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const s3 = new S3Client({ region: config.aws.region });
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: config.aws.resumeBucket,
        Key: `resumes/${file}`,
        ResponseContentDisposition: download === "1"
          ? `attachment; filename="${file}"`
          : "inline",
      }),
      { expiresIn: 300 }
    );
    return res.redirect(302, url);
  }

  // Development: serve straight off disk so the flow is testable before AWS.
  const path = join(resumeDir, file);
  if (!existsSync(path)) {
    return res.status(404).json({
      error: "That resume variant hasn't been uploaded yet.",
      expected: `backend/resumes/${file}`,
    });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${download === "1" ? "attachment" : "inline"}; filename="${file}"`
  );
  res.sendFile(path);
});

export default router;
