import { describe, expect, it } from "vitest";
import { brand, branches, contact, services } from "@/data/site-data";
import {
  branchesByCity,
  branchRegulator,
  cities,
  branchesOffering,
  currentYear,
  formatPhone,
  formatPKR,
  joinList,
  offeringPhrase,
  registeredWithShort,
  searchQuestionMessage,
  serviceQuestionMessage,
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

describe("currentYear", () => {
  it("uses the Karachi calendar, not UTC", () => {
    expect(currentYear(new Date(Date.UTC(2026, 11, 31, 18, 30)))).toBe(2026);
    expect(currentYear(new Date(Date.UTC(2026, 11, 31, 19, 30)))).toBe(2027);
  });
});

describe("formatPhone", () => {
  it("uses the display strings from site-data for known numbers", () => {
    expect(formatPhone(contact.mobile.e164)).toBe(contact.mobile.display);
    expect(formatPhone(contact.landline.e164)).toBe(contact.landline.display);
  });

  it("formats other Pakistani mobiles in the local style", () => {
    expect(formatPhone("+923001234567")).toBe("0300-1234567");
  });

  it("falls back to a national number, or the input if not Pakistani", () => {
    expect(formatPhone("+924212345678")).toBe("04212345678");
    expect(formatPhone("+441234567890")).toBe("+441234567890");
  });

  it("has a readable form for every branch phone", () => {
    for (const phone of branches.flatMap((b) => b.phones)) {
      expect(formatPhone(phone)).toMatch(/^[0(]/);
    }
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

describe("joinList", () => {
  it("joins with commas and a final conjunction", () => {
    expect(joinList([])).toBe("");
    expect(joinList(["a"])).toBe("a");
    expect(joinList(["a", "b"])).toBe("a and b");
    expect(joinList(["a", "b", "c"], "&")).toBe("a, b & c");
  });
});

describe("derived copy", () => {
  it("lists cities in data order without repeats", () => {
    expect(cities).toEqual([...new Set(branches.map((b) => b.city))]);
  });

  it("names registrations by short name", () => {
    expect(registeredWithShort).toBe("PHC & PNRA");
  });

  it("builds the offering from the service list", () => {
    expect(offeringPhrase(["laboratory", "diagnostics", "clinics"])).toBe(
      "laboratory testing, ECG, ultrasound & Doppler and specialist clinics",
    );
    expect(offeringPhrase()).toMatch(/and an on-site pharmacy$/);
  });
});

describe("formatPKR", () => {
  it("formats whole rupees with grouping", () => {
    expect(formatPKR(1500)).toMatch(/^Rs\s1,500$/);
    expect(formatPKR(250000)).toMatch(/^Rs\s250,000$/);
  });
});

describe("WhatsApp messages", () => {
  it("names the service the visitor was reading", () => {
    expect(serviceQuestionMessage("ECG")).toContain("ECG");
    expect(serviceQuestionMessage("ECG")).toMatch(/^Hello Ayyub Labs/);
  });

  it("quotes the search text, trimmed", () => {
    expect(searchQuestionMessage("  lipid profile ")).toContain(
      '"lipid profile"',
    );
  });
});

describe("branchesOffering", () => {
  it("lists every branch until per-branch data exists", () => {
    expect(branchesOffering(services[0])).toEqual(branches);
  });
});
