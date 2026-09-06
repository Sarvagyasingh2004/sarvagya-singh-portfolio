/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOT a static export any more. Running as a normal Next.js app on Vercel
  // buys three things a static export cannot:
  //   1. API routes — so the chatbot, contact form, resume and cron all run
  //      here. No second service, no Render free tier that sleeps.
  //   2. ISR — testimonials refresh on a timer without a rebuild.
  //   3. next/image optimization.
  // Vercel serverless functions do not sleep, so there is no keep-alive cron.
  reactStrictMode: true,

  // Sent on every response. Without these the site scores poorly on any
  // security scan and, more practically, can be framed by anyone.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stops the site being embedded in someone else's page.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stops a browser second-guessing a declared content type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send the origin to other sites, the full URL only to ourselves.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing here needs a camera, a microphone or a location.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Two years, subdomains included. Vercel serves HTTPS only.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // The API answers the site, not other origins, and must never be
        // cached by a proxy in between.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },

  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
    "postprocessing",
  ],
  // The resume PDF lives outside public/ so it has no crawlable URL; it is
  // read by the API route instead. Tracing has to be told to bundle it.
  outputFileTracingIncludes: {
    "/api/resume": ["./private/**"],
  },
};

export default nextConfig;
