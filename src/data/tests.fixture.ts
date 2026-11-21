/**
 * DUMMY tests for unit tests ONLY. Not real tests or prices.
 *
 * Never import this from site-data.ts, a page or a component: real tests
 * come from the client's spreadsheet via `pnpm import-tests`. Codes use the
 * FX- prefix so a leak is easy to spot (test-search.test.ts checks for one).
 */
import type { DirectoryTest } from "@/lib/test-filter";

export const FIXTURE_CODE_PREFIX = "FX-";

export const fixtureTests: DirectoryTest[] = [
  {
    id: "FX-001",
    code: "FX-001",
    name: "Complete Blood Count",
    aka: ["CBC", "Blood CP"],
    sample: "Blood (EDTA)",
    fasting: false,
    turnaround: "Same day",
    pricePKR: 900,
    homeSampling: true,
    serviceSlug: "haematology",
    serviceName: "Haematology",
  },
  {
    id: "FX-002",
    code: "FX-002",
    name: "Haemoglobin",
    aka: ["Hb"],
    sample: "Blood (EDTA)",
    fasting: false,
    turnaround: "Same day",
    pricePKR: 400,
    homeSampling: false,
    serviceSlug: "haematology",
    serviceName: "Haematology",
  },
  {
    id: "FX-003",
    code: "FX-003",
    name: "Lipid Profile",
    aka: ["Cholesterol test"],
    sample: "Blood (serum)",
    fasting: true,
    turnaround: "Next day",
    pricePKR: 2500,
    homeSampling: true,
    serviceSlug: "haematology",
    serviceName: "Haematology",
  },
  {
    id: "FX-004",
    code: "FX-004",
    name: "Urine Culture",
    aka: ["Urine C/S"],
    sample: "Urine",
    fasting: false,
    turnaround: "48 hours",
    pricePKR: 1800,
    serviceSlug: "microbiology",
    serviceName: "Microbiology",
  },
  {
    // No price, fasting or home-sampling info: exercises the gaps.
    id: "FX-005",
    code: "FX-005",
    name: "Dengue PCR",
    aka: ["Dengue RNA"],
    serviceSlug: "pcr-lab",
    serviceName: "PCR Lab",
  },
];
