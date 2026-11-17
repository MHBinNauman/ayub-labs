import type { TestItem } from "@/data/site-data";
import { formatPKR } from "@/lib/site";

type Column = {
  key: string;
  header: string;
  /** Whether any test has this value; columns nobody fills are left out. */
  present: (test: TestItem) => boolean;
  cell: (test: TestItem) => string;
  numeric?: boolean;
};

const columns: Column[] = [
  {
    key: "sample",
    header: "Sample",
    present: (t) => Boolean(t.sample),
    cell: (t) => t.sample ?? "",
  },
  {
    key: "fasting",
    header: "Fasting",
    present: (t) => t.fasting !== undefined,
    cell: (t) => (t.fasting === undefined ? "" : t.fasting ? "Yes" : "No"),
  },
  {
    key: "turnaround",
    header: "Results",
    present: (t) => Boolean(t.turnaround),
    cell: (t) => t.turnaround ?? "",
  },
  {
    key: "price",
    header: "Price",
    present: (t) => t.pricePKR !== undefined,
    cell: (t) => (t.pricePKR === undefined ? "" : formatPKR(t.pricePKR)),
    numeric: true,
  },
];

function Missing() {
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="sr-only">Not listed</span>
    </>
  );
}

/**
 * The tests offered under one service. Only columns that at least one test
 * fills are shown; an individual gap reads "Not listed" to screen readers.
 * Scrolls sideways on narrow screens, focusable so keyboard users can too.
 */
export function TestTable({
  tests,
  serviceName,
}: {
  tests: TestItem[];
  serviceName: string;
}) {
  if (tests.length === 0) return null;
  const shown = columns.filter((column) => tests.some(column.present));
  const caption = `${serviceName} tests`;

  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="overflow-x-auto rounded-card bg-white shadow-card ring-1 ring-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
    >
      <table className="w-full min-w-xl text-left text-sm">
        <caption className="px-5 pt-5 pb-3 text-left text-lg font-bold text-navy">
          {caption}
        </caption>
        <thead className="border-y border-ink/10 bg-surface text-xs tracking-wide text-muted uppercase">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">
              Test
            </th>
            {shown.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-5 py-3 font-semibold ${column.numeric ? "text-right" : ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {tests.map((test) => (
            <tr key={test.code ?? test.name}>
              <th scope="row" className="px-5 py-3 font-semibold text-ink">
                {test.name}
                {test.aka && test.aka.length > 0 && (
                  <span className="block text-xs font-normal text-muted">
                    Also called {test.aka.join(", ")}
                  </span>
                )}
              </th>
              {shown.map((column) => {
                const value = column.cell(test);
                return (
                  <td
                    key={column.key}
                    className={`px-5 py-3 text-ink ${column.numeric ? "text-right whitespace-nowrap tabular-nums" : ""}`}
                  >
                    {value || <Missing />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
