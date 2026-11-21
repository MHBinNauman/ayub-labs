import { describe, expect, it } from "vitest";
import { services } from "@/data/site-data";
import { FIXTURE_CODE_PREFIX, fixtureTests } from "@/data/tests.fixture";
import {
  DEFAULT_FILTER,
  effectiveSort,
  quickMatch,
  type TestFilter,
} from "./test-filter";
import { filterTests, searchTests } from "./test-search";

const names = (filter: Partial<TestFilter>) =>
  filterTests(fixtureTests, { ...DEFAULT_FILTER, ...filter }).map(
    (t) => t.name,
  );

describe("fixture isolation", () => {
  it("no dummy test ever reaches site-data", () => {
    const codes = services.flatMap((s) => s.tests.map((t) => t.code ?? ""));
    expect(
      codes.filter((code) => code.startsWith(FIXTURE_CODE_PREFIX)),
    ).toEqual([]);
  });
});

describe("searchTests", () => {
  it.each([
    ["hemoglobin", "Haemoglobin"],
    ["heamoglobin", "Haemoglobin"],
    ["lipd profile", "Lipid Profile"],
    ["complete blod count", "Complete Blood Count"],
  ])("tolerates the typo %j", (q, expected) => {
    expect(searchTests(fixtureTests, q)[0]?.name).toBe(expected);
  });

  it("finds a test by another name", () => {
    expect(searchTests(fixtureTests, "CBC")[0].name).toBe(
      "Complete Blood Count",
    );
    expect(searchTests(fixtureTests, "cholesterol")[0].name).toBe(
      "Lipid Profile",
    );
  });

  it("finds a test by code", () => {
    expect(searchTests(fixtureTests, "FX-004")[0].name).toBe("Urine Culture");
  });

  it("returns nothing for an unrelated query", () => {
    expect(searchTests(fixtureTests, "xylophone")).toEqual([]);
  });
});

describe("filterTests", () => {
  it("sorts by name when there is no query", () => {
    expect(names({})).toEqual([
      "Complete Blood Count",
      "Dengue PCR",
      "Haemoglobin",
      "Lipid Profile",
      "Urine Culture",
    ]);
  });

  it("filters by service", () => {
    expect(names({ service: "microbiology" })).toEqual(["Urine Culture"]);
  });

  it("filters by fasting; tests with no fasting info match neither", () => {
    expect(names({ fasting: "yes" })).toEqual(["Lipid Profile"]);
    expect(names({ fasting: "no" })).not.toContain("Dengue PCR");
    expect(names({ fasting: "no" })).toHaveLength(3);
  });

  it("filters by home sampling", () => {
    expect(names({ home: true })).toEqual([
      "Complete Blood Count",
      "Lipid Profile",
    ]);
  });

  it("sorts by price both ways with unpriced tests last", () => {
    expect(names({ sort: "price-asc" })).toEqual([
      "Haemoglobin",
      "Complete Blood Count",
      "Urine Culture",
      "Lipid Profile",
      "Dengue PCR",
    ]);
    expect(names({ sort: "price-desc" })).toEqual([
      "Lipid Profile",
      "Urine Culture",
      "Complete Blood Count",
      "Haemoglobin",
      "Dengue PCR",
    ]);
  });

  it("combines a query, a filter and a sort", () => {
    expect(
      names({ q: "blood", service: "haematology", sort: "name" }),
    ).toContain("Complete Blood Count");
  });

  it("'best match' falls back to name order without a query", () => {
    expect(effectiveSort("relevance", "")).toBe("name");
    expect(effectiveSort("relevance", "cbc")).toBe("relevance");
    expect(effectiveSort("price-asc", "")).toBe("price-asc");
  });
});

describe("quickMatch", () => {
  it("is a plain substring match on name, other names and code", () => {
    expect(quickMatch(fixtureTests, "c/s").map((t) => t.name)).toEqual([
      "Urine Culture",
    ]);
    expect(quickMatch(fixtureTests, "fx-002").map((t) => t.name)).toEqual([
      "Haemoglobin",
    ]);
  });
});
