/**
 * Import the client's test price list into the site.
 *
 *   pnpm import-tests               reads data/tests.csv
 *   pnpm import-tests path/to.csv   reads another file
 *
 * From Excel: File → Save As → "CSV UTF-8 (Comma delimited)". One row per
 * test, with this header row (any column order):
 *
 *   service_slug,code,name,aka,sample,fasting,turnaround,price_pkr,home_sampling
 *
 *   service_slug   a slug from services in src/data/site-data.ts, e.g. haematology
 *   code           optional, unique, e.g. CBC-01
 *   name           required
 *   aka            other names patients search for, separated by ; or |
 *   sample         e.g. Blood (EDTA)
 *   fasting        yes / no (blank = not stated)
 *   turnaround     e.g. Same day
 *   price_pkr      e.g. 1500 or Rs 1,500 (blank = not listed)
 *   home_sampling  yes / no (blank = not stated)
 *
 * Writes src/data/tests.generated.ts, which site-data.ts merges into each
 * service. If any row is invalid nothing is written and every problem is
 * listed. Afterwards set features.testDirectory = true to publish /tests.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { services } from "../src/data/site-data";
import { importTestsCsv, renderGeneratedFile } from "../src/lib/tests-csv";

const root = resolve(import.meta.dirname, "..");
const input = resolve(
  process.cwd(),
  process.argv[2] ?? resolve(root, "data/tests.csv"),
);
const output = resolve(root, "src/data/tests.generated.ts");

let text: string;
try {
  text = readFileSync(input, "utf8");
} catch {
  console.error(`Could not read ${input}`);
  process.exit(1);
}

if (text.includes("�")) {
  console.error(
    `${input} is not UTF-8. In Excel, save it as "CSV UTF-8 (Comma delimited)".`,
  );
  process.exit(1);
}

const result = importTestsCsv(
  text,
  services.map((service) => service.slug),
);

if (!result.ok) {
  console.error(
    `${input} was not imported (${result.errors.length} problem(s)):`,
  );
  for (const error of result.errors) console.error(`  - ${error}`);
  console.error("Nothing was written. Fix the file and run again.");
  process.exit(1);
}

writeFileSync(output, renderGeneratedFile(result.tests));

console.log(`Imported ${result.count} test(s) from ${input}`);
for (const service of services) {
  const n = result.tests[service.slug]?.length ?? 0;
  if (n > 0) console.log(`  ${service.slug}: ${n}`);
}
console.log(`Wrote ${output}`);
