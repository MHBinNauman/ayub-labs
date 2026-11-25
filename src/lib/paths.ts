/**
 * Navigation types and path matching with no imports, so client components
 * (MegaMenu, NavStrip, MobileNav) can use them without pulling site-data.ts
 * into the browser bundle. The data itself lives in site-data.ts and nav.ts
 * (server side) and reaches client components as props.
 */

export type ServiceMenuGroup = {
  category: string;
  label: string;
  items: { name: string; href: string; icon: string }[];
};

/**
 * Whether `href` is the current section. Home matches only itself; every
 * other link also matches its sub-pages ("/services/ecg" → "/services").
 */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const path = withoutTrailingSlash(pathname);
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

/**
 * aria-current for a nav link: "page" when it is the page being viewed,
 * "true" when the page is somewhere inside its section.
 */
export function ariaCurrent(
  pathname: string | null,
  href: string,
): "page" | "true" | undefined {
  if (!pathname || !isActivePath(pathname, href)) return undefined;
  return withoutTrailingSlash(pathname) === href ? "page" : "true";
}

function withoutTrailingSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}
