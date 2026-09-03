import type { MetadataRoute } from "next";

const SITE = "https://REPLACE_ME_DOMAIN";

// Required with output: "export" — without it Next treats these routes as
// dynamic and the build fails when collecting page data.
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
