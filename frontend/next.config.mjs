/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the whole site becomes pre-rendered HTML in out/, which is
  // what S3 + CloudFront serves. No server runtime on the frontend.
  output: "export",
  // S3's REST endpoint (required for OAC) does not resolve directory indexes,
  // so emit /about/index.html and link to /about/ to match the CloudFront
  // Function that appends index.html.
  trailingSlash: true,
  // next/image's optimizer needs a server; there isn't one in an export.
  // Images are pre-optimized at build time instead.
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
