import { describe, expect, it } from "vitest";
import {
  CSV_COLUMNS,
  importTestsCsv,
  parseAka,
  parseBool,
  parseCsv,
  parsePrice,
  renderGeneratedFile,
} from "./tests-csv";

const HEADER = CSV_COLUMNS.join(",");
const SLUGS = ["haematology", "microbiology"];
const csv = (...rows: string[]) => [HEADER, ...rows].join("\n");

describe("parseCsv", () => {
  it("handles quoted commas, escaped quotes and line breaks", () => {
    const records = parseCsv('a,"b, c","say ""hi""","two\nlines"\nnext,row');
    expect(records).toEqual([
      { line: 1, cells: ["a", "b, c", 'say "hi"', "two\nlines"] },
      { line: 3, cells: ["next", "row"] },
    ]);
  });

  it("strips the Excel BOM and accepts CRLF", () => {
    expect(parseCsv("﻿a,b\r\nc,d\r\n")).toEqual([
      { line: 1, cells: ["a", "b"] },
      { line: 2, cells: ["c", "d"] },
    ]);
  });

  it("keeps empty trailing cells", () => {
    expect(parseCsv("a,,\n")).toEqual([{ line: 1, cells: ["a", "", ""] }]);
  });
});

describe("cell parsers", () => {
  it.each([
    ["Yes", true],
    ["y", true],
    ["TRUE", true],
    ["1", true],
    ["no", false],
    ["N", false],
    ["0", false],
    ["", undefined],
    ["  ", undefined],
  ])("parseBool(%j) → %j", (input, expected) => {
    expect(parseBool(input)).toBe(expected);
  });

  it("rejects an unclear yes/no", () => {
    expect(parseBool("maybe")).toBeInstanceOf(Error);
  });

  it.each([
    ["1500", 1500],
    ["Rs 1,500", 1500],
    ["Rs. 2,000", 2000],
    ["PKR 900", 900],
    ["", undefined],
  ])("parsePrice(%j) → %j", (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each(["free", "0", "12.5", "-100"])("rejects price %j", (input) => {
    expect(parsePrice(input)).toBeInstanceOf(Error);
  });

  it("splits other names on ; or | and drops blanks and repeats", () => {
    expect(parseAka("CBC; Blood CP | CBC ;")).toEqual(["CBC", "Blood CP"]);
    expect(parseAka(" ")).toBeUndefined();
  });
});

describe("importTestsCsv", () => {
  it("converts rows, omits blank optional cells and groups by service", () => {
    const result = importTestsCsv(
      csv(
        'haematology,S-1,Sample A,"Alias 1; Alias 2",Blood,yes,Same day,"Rs 1,500",no',
        "microbiology,,Sample B,,,,,,",
        "haematology,S-2,Sample C,,,no,,800,",
      ),
      SLUGS,
    );
    expect(result).toEqual({
      ok: true,
      count: 3,
      tests: {
        haematology: [
          {
            code: "S-1",
            name: "Sample A",
            aka: ["Alias 1", "Alias 2"],
            sample: "Blood",
            fasting: true,
            turnaround: "Same day",
            pricePKR: 1500,
            homeSampling: false,
          },
          { code: "S-2", name: "Sample C", fasting: false, pricePKR: 800 },
        ],
        microbiology: [{ name: "Sample B" }],
      },
    });
  });

  it("accepts columns in any order and skips blank rows", () => {
    const header = [...CSV_COLUMNS].reverse().join(",");
    const result = importTestsCsv(
      `${header}\n,,,,,,,,\n,1000,,,,,Sample A,,haematology\n`,
      SLUGS,
    );
    expect(result.ok && result.tests.haematology).toEqual([
      { name: "Sample A", pricePKR: 1000 },
    ]);
  });

  it("imports nothing from a header-only file", () => {
    expect(importTestsCsv(`${HEADER}\n`, SLUGS)).toEqual({
      ok: true,
      tests: {},
      count: 0,
    });
  });

  it("reports every problem with its line number", () => {
    const result = importTestsCsv(
      csv(
        "unknown-service,S-1,Sample A,,,,,,",
        "haematology,S-1,,,,maybe,,free,sometimes",
        "haematology,S-2,Too few cells",
      ),
      SLUGS,
    );
    expect(result).toEqual({
      ok: false,
      errors: [
        'line 2: unknown service_slug "unknown-service"',
        "line 3: name is empty",
        'line 3: code "S-1" already used on line 2',
        'line 3: fasting: "maybe" is not yes or no',
        'line 3: home_sampling: "sometimes" is not yes or no',
        'line 3: price_pkr: "free" is not a price',
        "line 4: expected 9 cells, found 3",
      ],
    });
  });

  it("rejects a wrong header and says what it should be", () => {
    const result = importTestsCsv("slug,name,price\nhaematology,A,1", SLUGS);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatch(
      /^header: missing column\(s\) service_slug/,
    );
    expect(result.errors).toContain("header: unknown column(s) slug, price");
    expect(result.errors.at(-1)).toBe(`header must be: ${HEADER}`);
  });

  it("rejects an empty file", () => {
    expect(importTestsCsv("", SLUGS).ok).toBe(false);
  });
});

describe("renderGeneratedFile", () => {
  it("renders an empty map as {}", () => {
    expect(renderGeneratedFile({})).toContain(
      "export const generatedTests: Record<string, TestItem[]> = {};",
    );
  });

  it("marks the file as generated", () => {
    expect(
      renderGeneratedFile({ haematology: [{ name: "Sample A" }] }),
    ).toMatch(/^\/\*\*\n \* GENERATED by scripts\/import-tests\.ts/);
  });
});
