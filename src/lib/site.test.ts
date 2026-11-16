import { describe, expect, it } from "vitest";
import { brand, branches, services } from "@/data/site-data";
import {
  branchesByCity,
  branchRegulator,
  primaryBranch,
  servicesByCategory,
  yearsServing,
} from "./site";

const founded = brand.foundedYear.value;

describe("yearsServing", () => {
  it("counts only the years that are certain", () => {
    const tenYearsOn = new Date(Date.UTC(founded + 10, 5, 15));
    expect(yearsServing(tenYearsOn)).toEqual({ years: 9, label: "9+ years" });
  });

  it("rolls over at New Year in Karachi, not UTC", () => {
    // 31 Dec 19:30 UTC is already 1 Jan 00:30 in Karachi.
    const justAfter = new Date(Date.UTC(founded + 10, 11, 31, 19, 30));
    const justBefore = new Date(Date.UTC(founded + 10, 11, 31, 18, 30));
    expect(yearsServing(justBefore)?.years).toBe(9);
    expect(yearsServing(justAfter)?.years).toBe(10);
  });

  it("returns null before a full year is certain", () => {
    expect(yearsServing(new Date(Date.UTC(founded + 1, 5, 15)))).toBeNull();
  });
});

describe("derived collections", () => {
  it("picks the branch flagged as primary", () => {
    expect(primaryBranch.isPrimary).toBe(true);
  });

  it("groups every branch under its city exactly once", () => {
    const grouped = branchesByCity.flatMap((group) => group.branches);
    expect(grouped).toHaveLength(branches.length);
    for (const group of branchesByCity) {
      expect(group.branches.every((b) => b.city === group.city)).toBe(true);
    }
  });

  it("groups every service under its category exactly once", () => {
    const grouped = servicesByCategory.flatMap((group) => group.services);
    expect(grouped).toHaveLength(services.length);
    expect(servicesByCategory.every((group) => group.services.length > 0)).toBe(
      true,
    );
  });
});

describe("branchRegulator", () => {
  it("returns the regulator only when it is verified", () => {
    expect(
      branchRegulator({
        regulator: { value: "Some Authority", verified: true },
      }),
    ).toBe("Some Authority");
    expect(
      branchRegulator({
        regulator: { value: "TODO(client)", verified: false },
      }),
    ).toBeNull();
  });
});
