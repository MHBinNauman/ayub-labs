/**
 * Parses the client's test price list (data/tests.csv, exported from Excel)
 * into TestItems grouped by service slug, and renders the generated
 * src/data/tests.generated.ts. Pure: scripts/import-tests.ts does the file
 * I/O, so everything here is unit-testable.
 */
import type { TestItem } from "@/data/site-data";

export const CSV_COLUMNS = [
  "service_slug",
  "code",
  "name",
  "aka",
  "sample",
  "fasting",
  "turnaround",
  "price_pkr",
  "home_sampling",
] as const;

type Column = (typeof CSV_COLUMNS)[number];

export type CsvRecord = { line: number; cells: string[] };

export type ImportResult =
  | { ok: true; tests: Record<string, TestItem[]>; count: number }
  | { ok: false; errors: string[] };

/* ------------------------------------------------------------------ */
/* CSV (RFC 4180)                                                      */
/* ------------------------------------------------------------------ */

/**
 * Splits CSV text into records. Handles quoted fields with commas, quotes
 * ("") and line breaks, CRLF or LF endings and the UTF-8 BOM Excel writes.
 * `line` is the 1-based line on which each record starts, for error messages.
 */
export function parseCsv(input: string): CsvRecord[] {
  const text = input.replace(/^﻿/, "");
  const records: CsvRecord[] = [];
  let cells: string[] = [];
  let cell = "";
  let quoted = false;
  let line = 1;
  let recordLine = 1;

  const endCell = () => {
    cells.push(cell);
    cell = "";
  };
  const endRecord = () => {
    endCell();
    records.push({ line: recordLine, cells });
    cells = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        if (char === "\n") line++;
        cell += char;
      }
    } else if (char === '"' && cell === "") {
      quoted = true;
    } else if (char === ",") {
      endCell();
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      endRecord();
      line++;
      recordLine = line;
    } else {
      cell += char;
    }
  }
  if (cell !== "" || cells.length > 0) endRecord();

  return records;
}

/* ------------------------------------------------------------------ */
/* Cell conversion                                                     */
/* ------------------------------------------------------------------ */

const TRUE_WORDS = new Set(["yes", "y", "true", "1"]);
const FALSE_WORDS = new Set(["no", "n", "false", "0"]);

/** "Yes" / "no" / "1" / … → boolean; blank → undefined; anything else → error. */
export function parseBool(value: string): boolean | undefined | Error {
  const word = value.trim().toLowerCase();
  if (!word) return undefined;
  if (TRUE_WORDS.has(word)) return true;
  if (FALSE_WORDS.has(word)) return false;
  return new Error(`"${value.trim()}" is not yes or no`);
}

/** "Rs 1,500" / "1500" / "PKR 1 500" → 1500; blank → undefined. */
export function parsePrice(value: string): number | undefined | Error {
  const cleaned = value.replace(/rs\.?|pkr|[,\s]/gi, "");
  if (!cleaned) return undefined;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    return new Error(`"${value.trim()}" is not a price`);
  }
  const amount = Number(cleaned);
  if (!Number.isInteger(amount)) {
    return new Error(`"${value.trim()}" must be a whole number of rupees`);
  }
  if (amount <= 0) return new Error("price must be greater than 0");
  return amount;
}

/** "CBC; Blood CP | Complete blood picture" → ["CBC", "Blood CP", …]. */
export function parseAka(value: string): string[] | undefined {
  const names = [
    ...new Set(
      value
        .split(/[;|]/)
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ];
  return names.length > 0 ? names : undefined;
}

/* ------------------------------------------------------------------ */
/* Import                                                              */
/* ------------------------------------------------------------------ */

/**
 * Validates the whole file and converts it. Any problem fails the import
 * (nothing half-imported ships); every problem is reported at once, each with
 * its line number. Columns may come in any order; rows keep the file's order.
 */
export function importTestsCsv(
  input: string,
  serviceSlugs: readonly string[],
): ImportResult {
  const records = parseCsv(input).filter((record) =>
    record.cells.some((cell) => cell.trim() !== ""),
  );
  if (records.length === 0) {
    return { ok: false, errors: ["the file is empty (no header row)"] };
  }

  const [header, ...rows] = records;
  const names = header.cells.map((cell) => cell.trim().toLowerCase());
  const errors: string[] = [];
  const missing = CSV_COLUMNS.filter((column) => !names.includes(column));
  const unknown = names.filter(
    (name) => !(CSV_COLUMNS as readonly string[]).includes(name),
  );
  const repeated = names.filter((name, i) => names.indexOf(name) !== i);
  if (missing.length)
    errors.push(`header: missing column(s) ${missing.join(", ")}`);
  if (unknown.length)
    errors.push(`header: unknown column(s) ${unknown.join(", ")}`);
  if (repeated.length)
    errors.push(`header: repeated column(s) ${repeated.join(", ")}`);
  if (errors.length) {
    errors.push(`header must be: ${CSV_COLUMNS.join(",")}`);
    return { ok: false, errors };
  }

  const index = Object.fromEntries(
    CSV_COLUMNS.map((column) => [column, names.indexOf(column)]),
  ) as Record<Column, number>;
  const knownSlugs = new Set(serviceSlugs);
  const seenCodes = new Map<string, number>();
  const tests: Record<string, TestItem[]> = {};
  let count = 0;

  for (const { line, cells } of rows) {
    const at = (message: string) => errors.push(`line ${line}: ${message}`);
    if (cells.length !== names.length) {
      at(`expected ${names.length} cells, found ${cells.length}`);
      continue;
    }
    const get = (column: Column) => cells[index[column]].trim();

    const slug = get("service_slug");
    if (!slug) at("service_slug is empty");
    else if (!knownSlugs.has(slug)) at(`unknown service_slug "${slug}"`);

    const name = get("name");
    if (!name) at("name is empty");

    const code = get("code");
    if (code) {
      const key = code.toUpperCase();
      const first = seenCodes.get(key);
      if (first !== undefined)
        at(`code "${code}" already used on line ${first}`);
      else seenCodes.set(key, line);
    }

    const fasting = parseBool(get("fasting"));
    if (fasting instanceof Error) at(`fasting: ${fasting.message}`);
    const homeSampling = parseBool(get("home_sampling"));
    if (homeSampling instanceof Error)
      at(`home_sampling: ${homeSampling.message}`);
    const price = parsePrice(get("price_pkr"));
    if (price instanceof Error) at(`price_pkr: ${price.message}`);

    if (errors.length > 0) continue;

    const test: TestItem = { name };
    if (code) test.code = code;
    const aka = parseAka(get("aka"));
    if (aka) test.aka = aka;
    if (get("sample")) test.sample = get("sample");
    if (typeof fasting === "boolean") test.fasting = fasting;
    if (get("turnaround")) test.turnaround = get("turnaround");
    if (typeof price === "number") test.pricePKR = price;
    if (typeof homeSampling === "boolean") test.homeSampling = homeSampling;

    (tests[slug] ??= []).push(test);
    count++;
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, tests, count };
}

/** Source of src/data/tests.generated.ts for the given tests. */
export function renderGeneratedFile(tests: Record<string, TestItem[]>): string {
  const body =
    Object.keys(tests).length === 0 ? "{}" : JSON.stringify(tests, null, 2);
  return `/**
 * GENERATED by scripts/import-tests.ts from data/tests.csv. Do not edit by
 * hand: update the spreadsheet, save it as data/tests.csv and run
 * \`pnpm import-tests\`.
 */
import type { TestItem } from "./site-data";

export const generatedTests: Record<string, TestItem[]> = ${body};
`;
}
