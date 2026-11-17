import { describe, expect, it } from "vitest";
import { services } from "@/data/site-data";
import { toSearchableService } from "./nav";
import { filterServices } from "./service-search";

const all = services.map(toSearchableService);
const slugs = (list: { slug: string }[]) => list.map((s) => s.slug);

describe("filterServices", () => {
  it("returns everything in data order for an empty query", () => {
    expect(slugs(filterServices(all, { category: null, q: "" }))).toEqual(
      slugs(services),
    );
    expect(filterServices(all, { category: null, q: "   " })).toHaveLength(
      services.length,
    );
  });

  it("filters by category", () => {
    const diagnostics = filterServices(all, {
      category: "diagnostics",
      q: "",
    });
    expect(slugs(diagnostics)).toEqual(["ecg", "ultrasound-doppler"]);
  });

  it("matches the name, ranked first", () => {
    expect(filterServices(all, { category: null, q: "ECG" })[0].slug).toBe(
      "ecg",
    );
  });

  it("matches a word anywhere in the name", () => {
    expect(
      slugs(filterServices(all, { category: null, q: "doppler" })),
    ).toContain("ultrasound-doppler");
  });

  it("tolerates a typo", () => {
    expect(
      slugs(filterServices(all, { category: null, q: "haematolgy" })),
    ).toContain("haematology");
  });

  it("matches the legacy name from the old site", () => {
    // legacyName "Dermatologist" vs name "Dermatology Clinic".
    expect(
      slugs(filterServices(all, { category: null, q: "dermatologist" })),
    ).toContain("dermatology");
  });

  it("matches the category label", () => {
    expect(
      slugs(filterServices(all, { category: null, q: "consultations" })),
    ).toContain("telemedicine");
  });

  it("combines query and category", () => {
    const result = filterServices(all, { category: "laboratory", q: "ECG" });
    expect(slugs(result)).not.toContain("ecg");
  });

  it("returns nothing for nonsense", () => {
    expect(filterServices(all, { category: null, q: "zzqxv" })).toEqual([]);
  });
});
