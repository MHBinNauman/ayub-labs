/**
 * Fuzzy search over the test directory. Pulls in fuse.js, so the client
 * loads this module with a dynamic import() only once someone types.
 */
import Fuse from "fuse.js";
import { runFilter, type DirectoryTest, type TestFilter } from "./test-filter";

const indexes = new WeakMap<DirectoryTest[], Fuse<DirectoryTest>>();

function indexFor(tests: DirectoryTest[]): Fuse<DirectoryTest> {
  let index = indexes.get(tests);
  if (!index) {
    index = new Fuse(tests, {
      keys: [
        { name: "name", weight: 3 },
        { name: "aka", weight: 2 },
        { name: "code", weight: 2 },
      ],
      // Tolerates typos such as "hemoglobin" or "lipd".
      threshold: 0.35,
      ignoreLocation: true,
    });
    indexes.set(tests, index);
  }
  return index;
}

/** Tests matching `q`, best match first. */
export function searchTests(
  tests: DirectoryTest[],
  q: string,
): DirectoryTest[] {
  const query = q.trim();
  if (!query) return tests;
  return indexFor(tests)
    .search(query)
    .map((result) => result.item);
}

/** Fuzzy query, then the filters and sort. */
export function filterTests(
  tests: DirectoryTest[],
  filter: TestFilter,
): DirectoryTest[] {
  return runFilter(tests, filter, searchTests);
}
