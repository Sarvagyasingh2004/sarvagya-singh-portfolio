import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// ESM has no __dirname — derive it from import.meta.url.
const here = dirname(fileURLToPath(import.meta.url));
const knowledgeDir = join(here, "..", "..", "knowledge");

let cached = null;

// Files are concatenated in sorted filename order so the string is stable
// across restarts. At ~2.5k tokens this is cheap to send on every request;
// explicit context caching would add complexity for no meaningful saving.
export async function loadCorpus() {
  if (cached) return cached;

  const files = (await readdir(knowledgeDir)).filter((f) => f.endsWith(".md")).sort();
  const parts = await Promise.all(
    files.map((f) => readFile(join(knowledgeDir, f), "utf8"))
  );

  cached = parts.join("\n\n---\n\n");
  return cached;
}

export function corpusStats(text) {
  const words = text.trim().split(/\s+/).length;
  return { chars: text.length, words, approxTokens: Math.round(words * 1.35) };
}
