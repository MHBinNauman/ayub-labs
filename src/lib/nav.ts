/**
 * Site navigation model, shared by the desktop nav strip, the mobile drawer
 * and the footer. Plain serialisable data, so it can be passed from server
 * components to client components as props.
 */
import type { ServiceCardData } from "@/components/ui/ServiceCard";
import { serviceCategories, type Service } from "@/data/site-data";
import type { NavItem, ServiceMenuGroup } from "./paths";
import type { SearchableService } from "./service-search";
import { resolvedFeatures, servicesByCategory } from "./site";

export { isActivePath, type NavItem, type ServiceMenuGroup } from "./paths";

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services", megaMenu: true },
  // Linked only once the directory is live, so nothing points at a 404.
  ...(resolvedFeatures.testDirectory
    ? [{ label: "Tests & prices", href: "/tests" }]
    : []),
  { label: "Locations", href: "/locations" },
  { label: "Reports", href: "/reports" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const routes = {
  services: "/services",
  locations: "/locations",
  reports: "/reports",
  about: "/about",
  contact: "/contact",
  tests: "/tests",
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

/** What a service card needs, nothing more (it is serialised to the client). */
export function toServiceCard(service: Service): ServiceCardData {
  return {
    slug: service.slug,
    name: service.name,
    summary: service.summary,
    icon: service.icon,
    href: serviceHref(service.slug),
  };
}

/** A card plus the extra fields the services search matches against. */
export function toSearchableService(service: Service): SearchableService {
  return {
    ...toServiceCard(service),
    legacyName: service.legacyName,
    category: service.category,
    categoryLabel: serviceCategories[service.category].label,
  };
}
