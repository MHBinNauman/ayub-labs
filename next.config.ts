import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";
import { legacyRedirects } from "./src/data/site-data";
import { securityHeaders } from "./src/lib/security-headers";
import { validateMediaFiles } from "./src/lib/validate";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Not experimental.inlineCss: tried 2026-11-27. With cacheComponents the
  // stylesheet was repeated in every segment's RSC payload (home HTML 560 KB,
  // CSS 11 times), which cost more main-thread time than the request saved.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // All photos are local (public/), so there are no remotePatterns. No width
  // above 2400: that is the widest copy `pnpm images` writes.
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 640, 768, 1024, 1280, 1536, 1920, 2400],
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

export default function config(phase: string): NextConfig {
  // Not when serving: on Vercel public/ is not on the function's disk.
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_DEVELOPMENT_SERVER) {
    validateMediaFiles((publicPath) =>
      existsSync(join(process.cwd(), "public", publicPath)),
    );
  }
  return nextConfig;
}
