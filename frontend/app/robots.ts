import type { MetadataRoute } from "next";

const SITE = "https://sarvagyasingh.space";

// Required with output: "export" — without it Next treats these routes as
// dynamic and the build fails when collecting page data.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
