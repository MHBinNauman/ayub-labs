import type { NextConfig } from "next";
import { legacyRedirects } from "./src/data/site-data";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Old WordPress URLs → new pages (see legacyRedirects in site-data.ts).
  // Permanent ones send a classic 301 (Next's `permanent: true` would send
  // 308); temporary ones keep Next's 307.
  async redirects() {
    return legacyRedirects.map(({ source, destination, permanent }) =>
      permanent
        ? { source, destination, statusCode: 301 as const }
        : { source, destination, permanent: false },
    );
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders({
          dev: process.env.NODE_ENV === "development",
        }),
      },
    ];
  },
};

export default nextConfig;
