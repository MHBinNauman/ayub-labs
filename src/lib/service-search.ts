/**
 * Fuzzy search over services. Pulls in fuse.js, so client code loads this
 * module with a dynamic import() only once someone types, keeping fuse out
 * of the initial bundle. No site-data import: the data arrives as an argument.
 */
import Fuse from "fuse.js";
import type { ServiceCardData } from "@/components/ui/ServiceCard";

export type SearchableService = ServiceCardData & {
  legacyName: string;
  category: string;
  categoryLabel: string;
};

export type ServiceFilter = {
  /** A category id, or null for every category. */
  category: string | null;
  q: string;
};

const indexes = new WeakMap<SearchableService[], Fuse<SearchableService>>();

function indexFor(services: SearchableService[]): Fuse<SearchableService> {
  let index = indexes.get(services);
  if (!index) {
    index = new Fuse(services, {
      keys: [
        { name: "name", weight: 3 },
        { name: "legacyName", weight: 2 },
        { name: "categoryLabel", weight: 1 },
        { name: "summary", weight: 1 },
      ],
      threshold: 0.35,
      // Match anywhere in the field, so "doppler" finds "Ultrasound & Doppler".
      ignoreLocation: true,
    });
    indexes.set(services, index);
  }
  return index;
}

/**
 * Services in `category` matching `q`. An empty query keeps data order; a
 * query returns the best matches first.
 */
export function filterServices(
  services: SearchableService[],
  { category, q }: ServiceFilter,
): SearchableService[] {
  const query = q.trim();
  const matches = query
    ? indexFor(services)
        .search(query)
        .map((result) => result.item)
    : services;
  return category
    ? matches.filter((service) => service.category === category)
    : matches;
}
