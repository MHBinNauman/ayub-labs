/**
 * The site's public origin, used for canonical URLs, Open Graph URLs, the
 * sitemap, robots.txt and JSON-LD.
 *
 * Defaults to https://<brand.domain>. Set NEXT_PUBLIC_SITE_URL only to point
 * those absolute URLs somewhere else (see DEPLOY.md). NEXT_PUBLIC_* values are
 * inlined at build time, so changing it needs a new build/deploy.
 */
import { brand } from "@/data/site-data";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Normalises a configured site URL to a bare origin ("https://host[:port]").
 * Unset or blank falls back to https://<domain>. Anything that is not an
 * absolute https URL (http is allowed for localhost only) throws, so a typo
 * fails the build instead of shipping broken canonical URLs.
 */
export function resolveSiteUrl(
  raw: string | undefined,
  domain: string,
): string {
  const value = raw?.trim();
  if (!value) return `https://${domain}`;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must be an absolute URL such as https://${domain} (got "${value}")`,
    );
  }

  const local = LOCAL_HOSTS.has(url.hostname);
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) {
    throw new Error(`NEXT_PUBLIC_SITE_URL must use https:// (got "${value}")`);
  }
  return url.origin;
}

export const SITE_URL = resolveSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
  brand.domain,
);
