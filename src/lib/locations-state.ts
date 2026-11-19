/**
 * Which city filter and which branch the /locations finder shows, from the
 * URL (?city=&branch=). Pure, so the controls, the map and every card agree
 * on the same answer and it can be unit-tested.
 */

export type BranchRef = { id: string; cityId: string };

export type LocationsSelection = {
  /** A valid city id, or null for all cities. */
  city: string | null;
  /** Branches that pass the city filter, in data order. */
  visibleIds: string[];
  /** The branch the map shows: the URL's if visible, else the first visible. */
  branchId: string | null;
};

export function resolveSelection(
  params: { city: string | null; branch: string | null },
  branches: BranchRef[],
): LocationsSelection {
  const city =
    params.city && branches.some((b) => b.cityId === params.city)
      ? params.city
      : null;
  const visibleIds = branches
    .filter((b) => city === null || b.cityId === city)
    .map((b) => b.id);
  const branchId =
    params.branch && visibleIds.includes(params.branch)
      ? params.branch
      : (visibleIds[0] ?? null);
  return { city, visibleIds, branchId };
}

/** DOM id of a branch card, the scroll target when a branch is picked. */
export function branchCardId(branchId: string): string {
  return `branch-${branchId}`;
}

/** DOM id of a branch card's heading, focused after scrolling to the card. */
export function branchHeadingId(branchId: string): string {
  return `branch-${branchId}-heading`;
}
