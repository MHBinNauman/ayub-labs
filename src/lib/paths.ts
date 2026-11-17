/**
 * Navigation types and path matching with no imports, so client components
 * (MegaMenu, NavStrip, MobileNav) can use them without pulling site-data.ts
 * into the browser bundle. The data itself lives in nav.ts (server side) and
 * reaches client components as props.
 */

export type NavItem = {
  label: string;
  href: string;
  /** Opens the services mega menu on desktop and an accordion on mobile. */
  megaMenu?: boolean;
};

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
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}
