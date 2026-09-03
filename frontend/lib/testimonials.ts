import fallback from "@/content/testimonials.json";

export type Testimonial = {
  name: string;
  mentions: string;
  review: string;
  imgPath: string;
};

/**
 * Testimonials come from a Google Sheet fed by a Google Form.
 *
 * Now that the site runs on Vercel rather than as a static export, this uses
 * ISR: the sheet is re-read at most once an hour and the page is regenerated
 * in the background. So ticking `approved` in the sheet publishes the
 * testimonial automatically, within the hour, with NO rebuild and no GitHub
 * dispatch. The markup is still server-rendered, so it stays crawlable.
 *
 * If TESTIMONIALS_URL is unset, or Google is down, or the payload is
 * malformed, it falls back to the committed content/testimonials.json rather
 * than blanking the section.
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
      // ISR: refreshed at most once an hour without a rebuild.
      next: { revalidate: 3600 },
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
