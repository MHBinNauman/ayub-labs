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
  async redirects() {
    return legacyRedirects.map(({ source, destination, permanent }) => ({
      source,
      destination,
      permanent,
    }));
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
