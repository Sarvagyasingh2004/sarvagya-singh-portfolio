import { existsSync } from "node:fs";
import { join } from "node:path";
import { json } from "@/lib/server/util";

export const runtime = "nodejs";

export async function GET() {
  return json({ available: existsSync(join(process.cwd(), "private", "resume.pdf")) });
}
