/**
 * Site navigation model, shared by the desktop nav strip, the mobile drawer
 * and the footer. Plain serialisable data, so it can be passed from server
 * components to client components as props.
 */
import type { NavItem, ServiceMenuGroup } from "./paths";
import { servicesByCategory } from "./site";

export { isActivePath, type NavItem, type ServiceMenuGroup } from "./paths";

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
