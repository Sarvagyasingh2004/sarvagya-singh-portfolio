// The apex 308-redirects to www on Vercel, so www is the origin that actually
// serves a 200. Canonical, og:url, the sitemap and robots.txt all have to agree
// with that or Google is handed a canonical that redirects. One constant so the
// four of them cannot drift apart again.
export const SITE_URL = "https://www.sarvagyasingh.space";
