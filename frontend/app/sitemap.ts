import type { MetadataRoute } from "next";

const SITE = "https://sarvagyasingh.space";

export const dynamic = "force-static";

// Emitted as a static sitemap.xml during `next build` with output: "export".
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
