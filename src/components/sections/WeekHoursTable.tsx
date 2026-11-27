"use client";

import { cn } from "@/lib/cn";
import { zonedDay, type DayHoursRow } from "@/lib/hours";
import { useMinuteClock } from "@/lib/use-clock";

/**
 * Monday–Sunday opening hours with today's row highlighted. "Today" is the
 * day in Asia/Karachi, not the visitor's timezone, and is only known in the
 * browser: the static HTML has no highlight, and it appears after hydration
 * (rolling over at Karachi midnight while the page is open).
 */
export function WeekHoursTable({
  rows,
  caption,
}: {
  rows: DayHoursRow[];
  caption: string;
}) {
  const now = useMinuteClock();
  const today = now ? zonedDay(now) : null;

  return (
    <table className="w-full text-left text-sm sm:text-base">
      <caption className="sr-only">{caption}</caption>
      <tbody className="divide-y divide-ink/10">
        {rows.map((row) => {
          const isToday = row.day === today;
          return (
            <tr
              key={row.day}
              aria-current={isToday ? "date" : undefined}
              className={cn(isToday && "bg-tint font-semibold")}
            >
              <th
                scope="row"
                className="py-2.5 pr-4 pl-3 font-semibold text-ink"
              >
                {row.label}
                {isToday && (
                  <span className="ml-2 rounded-full bg-navy px-2 py-0.5 text-sm font-semibold text-white">
                    Today
                  </span>
                )}
              </th>
              <td
                className={cn(
                  "py-2.5 pr-3 text-right tabular-nums",
                  row.closed ? "text-muted" : "text-ink",
                )}
              >
                {row.hours}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
