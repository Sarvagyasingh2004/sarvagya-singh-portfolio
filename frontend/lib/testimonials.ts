import fallback from "@/content/testimonials.json";

export type Testimonial = {
  name: string;
  mentions: string;
  review: string;
  imgPath: string;
};

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
  imgPath: String(row.imgPath ?? ""),
});

export async function getTestimonials(): Promise<Testimonial[]> {
  const url = process.env.TESTIMONIALS_URL;
  if (!url) return fallback as Testimonial[];

  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
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
