"use client";

import { Clock } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { Branch } from "@/data/site-data";
import { cn } from "@/lib/cn";
import { formatWeekHours, getBranchStatus } from "@/lib/hours";
import { Badge } from "./Badge";

const MINUTE = 60_000;

/* A shared minute clock: one interval however many chips are on the page. */
function subscribe(onChange: () => void): () => void {
  const interval = setInterval(onChange, MINUTE);
  // A tab left in the background catches up as soon as it is shown again.
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/** The current minute. Stable within a minute, so React re-renders once a minute at most. */
const getMinute = () => Math.floor(Date.now() / MINUTE);
/** Unknown on the server: the page is prerendered, so "now" is not known until it runs in the browser. */
const getServerMinute = () => null;

type BranchStatusChipProps = {
  branch: Pick<Branch, "hours" | "hoursVerified">;
  className?: string;
};

/**
 * "Open now · closes 9:00 PM" / "Closed · opens Mon 10:00 AM", computed in
 * Asia/Karachi and refreshed every minute.
 *
 * The static HTML shows the branch's regular hours instead; the live status
 * replaces it once the page is running in the browser. Renders nothing for a
 * branch whose hours are unconfirmed, so it never claims a branch is open
 * on a guess.
 */
export function BranchStatusChip({ branch, className }: BranchStatusChipProps) {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);

  if (!branch.hoursVerified) return null;

  if (minute === null) {
    const openDays = formatWeekHours(branch).find((row) => !row.closed);
    if (!openDays) return null;
    return (
      <Badge className={cn("min-h-8", className)}>
        <Clock aria-hidden="true" className="size-3.5 text-brand-blue" />
        {openDays.label}
      </Badge>
    );
  }

  const status = getBranchStatus(branch, new Date(minute * MINUTE));
  return (
    <Badge
      variant={status.isOpen ? "open" : "closed"}
      className={cn("min-h-8", className)}
    >
      {status.label}
    </Badge>
  );
}
