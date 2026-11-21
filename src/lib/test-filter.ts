/**
 * Filtering and sorting for the /tests directory. No fuse.js and no
 * site-data value imports, so the client island can load it up front; the
 * fuzzy search lives in test-search.ts and is imported on demand.
 */
import type { TestItem } from "@/data/site-data";

/** A test plus the service it belongs to: one row of the directory. */
export type DirectoryTest = TestItem & {
  /** Unique across the directory: the code, else service slug + name. */
  id: string;
  serviceSlug: string;
  serviceName: string;
};

export const TEST_SORTS = [
  { id: "relevance", label: "Best match" },
  { id: "name", label: "Name (A–Z)" },
  { id: "price-asc", label: "Price (low to high)" },
  { id: "price-desc", label: "Price (high to low)" },
] as const;

export type TestSort = (typeof TEST_SORTS)[number]["id"];
export type FastingFilter = "any" | "yes" | "no";

export type TestFilter = {
  q: string;
  /** A service slug, or null for every service. */
  service: string | null;
  fasting: FastingFilter;
  /** Only tests that can be collected at home. */
  home: boolean;
  sort: TestSort;
};

export const DEFAULT_FILTER: TestFilter = {
  q: "",
  service: null,
  fasting: "any",
  home: false,
  sort: "relevance",
};

export function isTestSort(value: string | null): value is TestSort {
  return TEST_SORTS.some((option) => option.id === value);
}

/** "Best match" only means something with a query; otherwise sort by name. */
export function effectiveSort(sort: TestSort, q: string): TestSort {
  return sort === "relevance" && !q.trim() ? "name" : sort;
}

const byName = (a: DirectoryTest, b: DirectoryTest) =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base" });

/** Sorted copy. Tests without a price go last in either price order. */
export function sortTests(
  tests: DirectoryTest[],
  sort: TestSort,
): DirectoryTest[] {
  if (sort === "relevance") return tests;
  if (sort === "name") return [...tests].sort(byName);
  const direction = sort === "price-asc" ? 1 : -1;
  return [...tests].sort((a, b) => {
    if (a.pricePKR === undefined || b.pricePKR === undefined) {
      if (a.pricePKR === b.pricePKR) return byName(a, b);
      return a.pricePKR === undefined ? 1 : -1;
    }
    return (a.pricePKR - b.pricePKR) * direction || byName(a, b);
  });
}

/** The service, fasting and home-sampling filters (not the query). */
export function applyFilters(
  tests: DirectoryTest[],
  { service, fasting, home }: Pick<TestFilter, "service" | "fasting" | "home">,
): DirectoryTest[] {
  return tests.filter(
    (test) =>
      (!service || test.serviceSlug === service) &&
      (fasting === "any" || test.fasting === (fasting === "yes")) &&
      (!home || test.homeSampling === true),
  );
}

/** Plain substring match on name, other names and code. */
export function quickMatch(tests: DirectoryTest[], q: string): DirectoryTest[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return tests;
  return tests.filter((test) =>
    [test.name, test.code ?? "", ...(test.aka ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

/**
 * The whole pipeline with a pluggable matcher: `match` narrows (and, for
 * fuzzy search, orders) by the query, then filters and the sort apply.
 */
export function runFilter(
  tests: DirectoryTest[],
  filter: TestFilter,
  match: (tests: DirectoryTest[], q: string) => DirectoryTest[] = quickMatch,
): DirectoryTest[] {
  const matched = filter.q.trim() ? match(tests, filter.q) : tests;
  return sortTests(
    applyFilters(matched, filter),
    effectiveSort(filter.sort, filter.q),
  );
}
