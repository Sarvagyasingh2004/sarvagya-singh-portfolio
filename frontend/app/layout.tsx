import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/site";
import { faviconScript, themeInitScript } from "@/lib/theme";
import { devtoolsVersionShim } from "@/lib/devtoolsShim";
import Loader from "@/components/Loader";
import "./globals.css";

const SITE = SITE_URL;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0b16" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Sarvagya Singh — Full-Stack & Backend Engineer",
    template: "%s | Sarvagya Singh",
  },
  description:
    "Full-stack and backend engineer in Delhi NCR. I build production APIs, async pipelines and query optimizations in Node.js and TypeScript — including a self-service alerting platform and a 40s to 400ms dashboard rewrite.",
  keywords: [
    "Sarvagya Singh", "backend engineer", "full-stack developer",
    "Node.js", "TypeScript", "React", "Delhi NCR", "remote developer India",
  ],
  authors: [{ name: "Sarvagya Singh", url: SITE }],
  creator: "Sarvagya Singh",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Sarvagya Singh",
    title: "Sarvagya Singh — Full-Stack & Backend Engineer",
    description:
      "Production APIs, async pipelines and query optimization in Node.js and TypeScript. 12 months shipping across two production codebases.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarvagya Singh — Full-Stack & Backend Engineer",
    description:
      "Production APIs, async pipelines and query optimization in Node.js and TypeScript.",
  },
  robots: { index: true, follow: true },
};

// Person schema is what surfaces this site when a recruiter googles the name.
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sarvagya Singh",
  jobTitle: "Full-Stack Software Engineer",
  url: SITE,
  image: `${SITE}/opengraph-image`,
  description:
    "Full-stack and backend engineer in Delhi NCR building production APIs, " +
    "async pipelines and query optimizations in Node.js and TypeScript.",
  address: {
    "@type": "PostalAddress",
    addressRegion: "Delhi NCR",
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Maharaja Agrasen Institute of Technology",
  },
  knowsAbout: [
    "Node.js", "TypeScript", "React", "Express", "MySQL", "PostgreSQL",
    "MongoDB", "Redis", "RabbitMQ", "AWS", "Docker", "Next.js",
  ],
  sameAs: [
    "https://github.com/Sarvagyasingh2004",
    "https://www.linkedin.com/in/sarvagya-singh-1015722a4",
    "https://leetcode.com/u/Sarvagyasingh_2004/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/brand/mark-256.webp" type="image/webp" />
        <link rel="icon" type="image/png" sizes="64x64" href="/brand/favicon-dark.png" media="(prefers-color-scheme: dark)" />
        <link rel="icon" type="image/png" sizes="64x64" href="/brand/favicon-light.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" sizes="180x180" href="/brand/favicon-dark-180.png" />
        <script dangerouslySetInnerHTML={{ __html: faviconScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {process.env.NODE_ENV !== "production" ? (
          <script dangerouslySetInnerHTML={{ __html: devtoolsVersionShim }} />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <Loader />
        {children}
      </body>
    </html>
  );
}
