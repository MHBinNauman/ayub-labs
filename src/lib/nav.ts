/**
 * Site navigation model, shared by the desktop nav strip, the mobile drawer
 * and the footer. Plain serialisable data, so it can be passed from server
 * components to client components as props.
 */
import { servicesByCategory } from "./site";

export type NavItem = {
  label: string;
  href: string;
  /** Opens the services mega menu on desktop and an accordion on mobile. */
  megaMenu?: boolean;
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services", megaMenu: true },
  { label: "Locations", href: "/locations" },
  { label: "Reports", href: "/reports" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const routes = {
  services: "/services",
  locations: "/locations",
  reports: "/reports",
} as const;

export function serviceHref(slug: string): string {
  return `${routes.services}/${slug}`;
}

export type ServiceMenuGroup = {
  category: string;
  label: string;
  items: { name: string; href: string; icon: string }[];
};

/** Services grouped by category, reduced to what a menu needs. */
export const serviceMenu: ServiceMenuGroup[] = servicesByCategory.map(
  (group) => ({
    category: group.category,
    label: group.label,
    items: group.services.map((service) => ({
      name: service.name,
      href: serviceHref(service.slug),
      icon: service.icon,
    })),
  }),
);

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
