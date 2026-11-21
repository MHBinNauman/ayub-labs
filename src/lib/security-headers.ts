/**
 * Security headers sent with every response (wired up in next.config.ts).
 * Pure and import-free so next.config can load it and tests can check it.
 */

/** Origins allowed to be framed: the keyless Google Maps embed (lib/links.ts). */
export const MAP_FRAME_ORIGINS = [
  "https://www.google.com",
  "https://maps.google.com",
] as const;

/**
 * Content-Security-Policy.
 *
 * `script-src 'unsafe-inline'` is deliberate: every page is prerendered
 * (Cache Components + Partial Prefetching) and Next inlines its RSC payload
 * as <script> tags. A nonce needs per-request rendering, which the Next 16
 * docs note is incompatible with PPR, so this is the documented
 * "without nonces" policy. Everything else is locked to our own origin.
 */
export function contentSecurityPolicy({ dev }: { dev: boolean }): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // React's dev tooling needs eval; production never gets it.
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(dev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...(dev ? ["ws:"] : [])],
    "frame-src": [...MAP_FRAME_ORIGINS],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    ...(dev ? {} : { "upgrade-insecure-requests": [] }),
  };
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(" "))
    .join("; ");
}

/** Browser features the site never uses, switched off. */
export const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
  "interest-cohort=()",
  "browsing-topics=()",
].join(", ");

export function securityHeaders({ dev }: { dev: boolean }) {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy({ dev }) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
  ];
}
