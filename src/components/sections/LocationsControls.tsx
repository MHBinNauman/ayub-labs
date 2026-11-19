"use client";

import { MapPin, RotateCcw } from "lucide-react";
import { useId } from "react";
import { BranchStatusChip } from "@/components/ui/BranchStatusChip";
import { cn } from "@/lib/cn";
import {
  branchCardId,
  branchHeadingId,
  resolveSelection,
} from "@/lib/locations-state";
import { useHydrated } from "@/lib/use-hydrated";
import { setUrlParams, useUrlParams } from "@/lib/use-url-params";
import type { CityOption, FinderBranch } from "./locations-types";

const ALL = "all";

/** Brings a branch card into view and moves focus to its heading. */
function revealCard(branchId: string) {
  const card = document.getElementById(branchCardId(branchId));
  if (!card) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  document
    .getElementById(branchHeadingId(branchId))
    ?.focus({ preventScroll: true });
}

/**
 * City filter, Reset, and the branch list (left 40% of the finder). Writes
 * ?city= and ?branch= to the URL; the map and cards read the same store.
 */
export function LocationsControls({
  branches,
  cities,
}: {
  branches: FinderBranch[];
  cities: CityOption[];
}) {
  const selectId = useId();
  const params = useUrlParams();
  const hydrated = useHydrated();
  const { city, visibleIds, branchId } = resolveSelection(
    { city: params.get("city"), branch: params.get("branch") },
    branches,
  );
  const visible = branches.filter((branch) => visibleIds.includes(branch.id));

  function pick(id: string) {
    setUrlParams({ branch: id }, { push: true });
    // After React has applied the selection (the card may have just shown).
    requestAnimationFrame(() => revealCard(id));
  }

  return (
    <div data-hydrated={hydrated || undefined} className="flex flex-col">
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            City
          </label>
          <select
            id={selectId}
            value={city ?? ALL}
            onChange={(event) => {
              const value = event.target.value;
              setUrlParams(
                { city: value === ALL ? null : value, branch: null },
                { push: true },
              );
            }}
            className="min-h-12 w-full rounded-lg border border-ink/20 bg-white px-3 text-base text-ink shadow-card focus-visible:border-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            <option value={ALL}>All cities</option>
            {cities.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() =>
            setUrlParams({ city: null, branch: null }, { push: true })
          }
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-navy px-4 font-semibold text-white transition-colors hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Reset
        </button>
      </div>

      {/* Phones: the cards below are the list, so this one is desktop only. */}
      <p className="mt-5 hidden text-sm text-muted lg:block" role="status">
        {visible.length === 1 ? "1 branch" : `${visible.length} branches`}
      </p>
      <ul
        aria-label="Branches"
        className="mt-2 hidden max-h-80 space-y-2 overflow-y-auto overscroll-contain rounded-card p-1 lg:block"
      >
        {visible.map((branch) => {
          const selected = branch.id === branchId;
          return (
            <li key={branch.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => pick(branch.id)}
                className={cn(
                  "flex min-h-16 w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
                  selected
                    ? "border-navy bg-tint"
                    : "border-ink/10 bg-white hover:border-navy/40",
                )}
              >
                <MapPin
                  aria-hidden="true"
                  className="size-5 shrink-0 text-brand-blue"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-navy">
                    {branch.name}
                  </span>
                  <span className="block text-sm text-muted">
                    {branch.area}
                  </span>
                </span>
                <BranchStatusChip branch={branch} variant="dot" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
