import path from "node:path";
import type { NextConfig } from "next";

// The browser calls /api/*, and Next proxies it to the backend. This keeps everything
// same-origin, so the backend needs no CORS setup. Rewrites are fixed at build time.
const apiUrl = process.env.API_URL?.replace(/\/+$/, "");

if (!apiUrl) {
  throw new Error(
    "API_URL is not set. Local dev reads it from .env.development. On Vercel, add it under " +
      "Project Settings → Environment Variables and redeploy. See .env.example.",
  );
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  // Pin the project root so a stray lockfile in a parent directory doesn't confuse Next.
  turbopack: {
    root: path.join(__dirname),
  },

  poweredByHeader: false,

  // The dev badge sits on top of the mobile bottom nav.
  devIndicators: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
