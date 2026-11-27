"use client";

import { Clock } from "lucide-react";
import type { Branch } from "@/data/site-data";
import { cx } from "@/lib/cx";
import { formatWeekHours, getBranchStatus } from "@/lib/hours";
import { useMinuteClock } from "@/lib/use-clock";
import { Badge } from "./Badge";

type BranchStatusChipProps = {
  branch: Pick<Branch, "hours" | "hoursVerified">;
  /** "chip": a labelled badge. "dot": a coloured dot with a screen-reader label, for lists. */
  variant?: "chip" | "dot";
  className?: string;
};

/**
 * "Open now · closes 9:00 PM" / "Closed · opens Mon 10:00 AM", computed in
 * Asia/Karachi and refreshed every minute.
 *
 * The static HTML shows the branch's regular hours instead (a neutral dot for
 * the dot variant); the live status replaces it once the page runs in the
 * browser. Renders nothing for a branch whose hours are unconfirmed, so it
 * never claims a branch is open on a guess.
 */
export function BranchStatusChip({
  branch,
  variant = "chip",
  className,
}: BranchStatusChipProps) {
  const now = useMinuteClock();

  if (!branch.hoursVerified) return null;

  const status = now ? getBranchStatus(branch, now) : null;

  if (variant === "dot") {
    return (
      <span
        className={cx("inline-flex items-center gap-1.5 text-sm", className)}
      >
        <span
          aria-hidden="true"
          className={cx(
            "size-2.5 shrink-0 rounded-full",
            !status && "bg-ink/20",
            status?.isOpen && "bg-brand-blue",
            status && !status.isOpen && "bg-brand-red",
          )}
        />
        {status && (
          <span className="font-semibold text-muted">
            {status.isOpen ? "Open" : "Closed"}
          </span>
        )}
      </span>
    );
  }

  if (!status) {
    const openDays = formatWeekHours(branch).find((row) => !row.closed);
    if (!openDays) return null;
    return (
      <Badge className={cx("min-h-8", className)}>
        <Clock aria-hidden="true" className="size-3.5 text-brand-blue" />
        {openDays.label}
      </Badge>
    );
  }

  return (
    <Badge
      variant={status.isOpen ? "open" : "closed"}
      className={cx("min-h-8", className)}
    >
      {status.label}
    </Badge>
  );
}
