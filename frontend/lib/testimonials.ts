import fallback from "@/content/testimonials.json";

export type Testimonial = {
  name: string;
  mentions: string;
  review: string;
  imgPath: string;
};

/**
 * Where testimonials come from, and why it works this way.
 *
 * The site is a static export, so there is no server at request time and no
 * ISR. That means the Sheet is read ONCE, during `next build`, and baked into
 * the HTML. Consequences, both deliberate:
 *
 *   1. Testimonials ship as real crawlable markup, not a client-side fetch
 *      that Google may never execute. Good for SEO.
 *   2. Approving a new testimonial does NOT appear instantly — it needs a
 *      rebuild. The Apps Script trigger fires a GitHub repository_dispatch to
 *      do exactly that, so the lag is a deploy, roughly 2-3 minutes.
 *
 * If TESTIMONIALS_URL is unset, or Google is down, or the payload is malformed,
 * we fall back to the committed snapshot in content/testimonials.json rather
 * than failing the build or shipping an empty section.
 */
const isValid = (row: unknown): row is Testimonial => {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.name === "string" && r.name.trim().length > 0 &&
    typeof r.review === "string" && r.review.trim().length > 0
  );
};

const normalize = (row: Record<string, unknown>): Testimonial => ({
  name: String(row.name).trim(),
  mentions: String(row.mentions ?? "").trim(),
  review: String(row.review).trim(),
  // Submitters don't upload photos; a shared placeholder keeps the card layout
  // intact without inventing a face.
  imgPath: String(row.imgPath ?? "/images/person.png"),
});

export async function getTestimonials(): Promise<Testimonial[]> {
  const url = process.env.TESTIMONIALS_URL;
  if (!url) return fallback as Testimonial[];

  try {
    const res = await fetch(url, {
      // Build-time only; never cache a stale sheet into the artifact.
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`sheet responded ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("sheet did not return an array");

    const rows = data.filter(isValid).map(normalize);
    console.log(`[testimonials] ${rows.length} approved rows from the sheet`);
    return rows;
  } catch (err) {
    console.warn(
      `[testimonials] sheet fetch failed (${(err as Error).message}) — using committed fallback`
    );
    return fallback as Testimonial[];
  }
}
