import { Router } from "express";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeLimiter } from "../middleware/limits.js";
import { config, featureFlags } from "../lib/config.js";
import { isDbConnected } from "../lib/db.js";
import { ResumeGrant } from "../models/index.js";
import { hashIp } from "../lib/hash.js";

const router = Router();
const here = dirname(fileURLToPath(import.meta.url));
const FILE = "sarvagya-singh-resume.pdf";
const localPath = join(here, "..", "..", "resumes", FILE);

// Lets the UI disable the button rather than offer a download that 404s.
router.get("/status", (req, res) => {
  res.json({
    available: featureFlags.resume || existsSync(localPath),
    source: featureFlags.resume ? "s3" : "local",
  });
});

router.get("/", writeLimiter, async (req, res) => {
  // Track before serving — how many recruiters pull the resume is the single
  // most useful number in the nightly digest.
  if (isDbConnected()) {
    ResumeGrant.create({
      ipHash: hashIp(req.ip),
      referrer: req.get("referer") || "",
    }).catch(() => {});
  }

  const disposition = `attachment; filename="${FILE}"`;

  // Production: short-lived presigned URL, bucket stays private.
  if (featureFlags.resume) {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const s3 = new S3Client({ region: config.aws.region });
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: config.aws.resumeBucket,
        Key: `resumes/${FILE}`,
        ResponseContentDisposition: disposition,
      }),
      { expiresIn: 300 }
    );
    return res.redirect(302, url);
  }

  // Development: stream from disk so the flow is testable before AWS exists.
  if (!existsSync(localPath)) {
    return res
      .status(404)
      .json({ error: "Resume not uploaded yet.", expected: `backend/resumes/${FILE}` });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", disposition);
  res.sendFile(localPath);
});

export default router;
