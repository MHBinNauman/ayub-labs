import { describe, expect, it } from "vitest";
import { resolveSelection } from "./locations-state";

// Fixture, not real branches, so the tests survive the client adding one.
const branches = [
  { id: "a1", cityId: "alpha" },
  { id: "a2", cityId: "alpha" },
  { id: "b1", cityId: "beta" },
];

const select = (city: string | null, branch: string | null) =>
  resolveSelection({ city, branch }, branches);

describe("resolveSelection", () => {
  it("shows every branch and picks the first by default", () => {
    expect(select(null, null)).toEqual({
      city: null,
      visibleIds: ["a1", "a2", "b1"],
      branchId: "a1",
    });
  });

  it("filters by city and defaults to that city's first branch", () => {
    expect(select("beta", null)).toEqual({
      city: "beta",
      visibleIds: ["b1"],
      branchId: "b1",
    });
  });

  it("keeps a requested branch that is visible", () => {
    expect(select(null, "b1").branchId).toBe("b1");
    expect(select("alpha", "a2").branchId).toBe("a2");
  });

  it("ignores a branch outside the city filter", () => {
    expect(select("alpha", "b1").branchId).toBe("a1");
  });

  it("ignores unknown values", () => {
    expect(select("nowhere", "nothing")).toEqual(select(null, null));
  });
});
