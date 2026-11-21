/**
 * Page titles, shared by each page's metadata and its Open Graph image so
 * the two can never disagree.
 */
import { brand } from "@/data/site-data";
import { cities, joinList } from "./site";

/** Full home title (no "| Ayyub Labs & Clinics" template). */
export const homeTitle = `${brand.displayName} | Diagnostic Lab in ${joinList(cities, "&")}`;

/** Home Open Graph title (the brand name is already on the image). */
export const homeOgTitle = `Diagnostic lab in ${joinList(cities, "&")}`;

export const pageTitles = {
  about: "About us",
  contact: "Contact us",
  locations: "Our branches",
  reports: "Test reports",
  services: "Services",
  tests: "Tests and prices",
} as const;

export function branchTitle(branch: { name: string }): string {
  return `${branch.name} branch`;
}
