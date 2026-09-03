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
