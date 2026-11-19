import type { Branch } from "@/data/site-data";

/** What the /locations client islands need about a branch; serialisable. */
export type FinderBranch = Pick<
  Branch,
  "id" | "name" | "area" | "hours" | "hoursVerified"
> & {
  cityId: string;
  /** Google Maps embed URL for the iframe. */
  mapSrc: string;
};

export type CityOption = { id: string; label: string };
