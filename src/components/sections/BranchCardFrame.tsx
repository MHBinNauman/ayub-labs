"use client";

import { MapPinned } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  branchCardId,
  resolveSelection,
  type BranchRef,
} from "@/lib/locations-state";
import { setUrlParams, useUrlParams } from "@/lib/use-url-params";

/**
 * Wraps a server-rendered branch card: scroll target, hidden when the city
 * filter excludes it, navy ring when it is the branch on the map.
 */
export function BranchCardFrame({
  branchId,
  branches,
  children,
}: {
  branchId: string;
  branches: BranchRef[];
  children: ReactNode;
}) {
  const params = useUrlParams();
  const { visibleIds, branchId: selectedId } = resolveSelection(
    { city: params.get("city"), branch: params.get("branch") },
    branches,
  );
  const selected = selectedId === branchId;

  return (
    <li
      id={branchCardId(branchId)}
      hidden={!visibleIds.includes(branchId)}
      data-selected={selected || undefined}
      className={cn(
        // Clears the sticky header when scrolled to.
        "scroll-mt-24 rounded-card ring-2 ring-offset-2 transition-shadow",
        selected ? "ring-navy" : "ring-transparent",
      )}
    >
      {children}
    </li>
  );
}

/** Desktop only: puts this branch on the finder's map and brings the map into view. */
export function ShowOnMapButton({
  branchId,
  branchName,
}: {
  branchId: string;
  branchName: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        setUrlParams({ branch: branchId }, { push: true });
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        document.getElementById("locations-map")?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "nearest",
        });
      }}
      className="hidden min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-navy transition-colors hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:inline-flex"
    >
      <MapPinned aria-hidden="true" className="size-4" />
      {/* Visible text first, so voice users can say "Show on map" (WCAG 2.5.3). */}
      Show on map<span className="sr-only"> for {branchName}</span>
    </button>
  );
}
