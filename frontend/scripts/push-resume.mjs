/**
 * Uploads private/resume.pdf into MongoDB so production can serve it.
 *
 * The PDF is deliberately not in the repository — it carries a phone number
 * and the repository is public — so it has to reach production some other
 * way. Vercel environment variables cap at 64KB combined, and base64 of this
 * file is ~290KB, so the file goes into Mongo, where the site's other state
 * already lives.
 *
 * Run once after any resume change:  npm run resume:push
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import mongoose from "mongoose";

const FILE = join(process.cwd(), "private", "resume.pdf");

const uri = process.env.MONGODB_URI || (await readEnvLocal("MONGODB_URI"));
if (!uri) {
  console.error("MONGODB_URI is not set (checked the environment and .env.local).");
  process.exit(1);
}
if (!existsSync(FILE)) {
  console.error(`No file at ${FILE}`);
  process.exit(1);
}

async function readEnvLocal(key) {
  try {
    const txt = await readFile(join(process.cwd(), ".env.local"), "utf8");
    return txt.match(new RegExp("^" + key + "=(.*)$", "m"))?.[1]?.trim() || null;
  } catch {
    return null;
  }
}

const pdf = await readFile(FILE);
await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });

const ResumeFile =
  mongoose.models.ResumeFile ||
  mongoose.model(
    "ResumeFile",
    new mongoose.Schema(
      {
        slug: { type: String, unique: true, index: true },
        data: Buffer,
        contentType: { type: String, default: "application/pdf" },
        bytes: Number,
        updatedAt: { type: Date, default: Date.now },
      },
      { versionKey: false }
    )
  );

await ResumeFile.findOneAndUpdate(
  { slug: "resume" },
  { slug: "resume", data: pdf, contentType: "application/pdf", bytes: pdf.length, updatedAt: new Date() },
  { upsert: true, new: true }
);

const check = await ResumeFile.findOne({ slug: "resume" }).lean();
console.log(
  `uploaded ${pdf.length} bytes -> ${mongoose.connection.db.databaseName}.resumefiles ` +
    `(read back ${Buffer.from(check?.data?.buffer ?? check?.data ?? []).length} bytes)`
);
await mongoose.disconnect();
