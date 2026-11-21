"use client";

import { MapLoading } from "@/components/ui/MapLoading";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { resolveSelection } from "@/lib/locations-state";
import { useIsDesktop } from "@/lib/use-media-query";
import { useUrlParams } from "@/lib/use-url-params";
import type { FinderBranch } from "./locations-types";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The finder's large map (right 60%, lg and up only). Rendered only on
 * desktop, so phones never download it; they get a map per card instead.
 *
 * Crossfade: the newly selected branch's iframe is stacked over the current
 * one at opacity 0 and fades in once it has loaded; the old one is then
 * dropped. Under reduced motion it swaps as soon as the new map is ready.
 */
export function LocationsMap({ branches }: { branches: FinderBranch[] }) {
  const desktop = useIsDesktop();
  const params = useUrlParams();
  const { branchId } = resolveSelection(
    { city: params.get("city"), branch: params.get("branch") },
    branches,
  );
  /** The branch whose map is fully visible underneath. */
  const [shownId, setShownId] = useState<string | null>(null);
  /** The top layer has loaded and is fading in. */
  const [loadedId, setLoadedId] = useState<string | null>(null);

  if (!desktop || !branchId) {
    return <div aria-hidden="true" className="size-full bg-tint" />;
  }

  const layers =
    shownId && shownId !== branchId ? [shownId, branchId] : [branchId];

  return (
    <div className="relative size-full bg-tint">
      <MapLoading />
      {layers.map((id) => {
        const branch = branches.find((b) => b.id === id);
        if (!branch) return null;
        const isTop = id === branchId;
        const visible = !isTop || shownId === id || loadedId === id;
        return (
          <iframe
            key={id}
            src={branch.mapSrc}
            title={`Map of ${branch.name}`}
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            // Only the selected map is exposed to assistive tech and Tab.
            aria-hidden={isTop ? undefined : true}
            tabIndex={isTop ? undefined : -1}
            onLoad={() => {
              if (!isTop) return;
              setLoadedId(id);
              if (prefersReducedMotion()) setShownId(id);
            }}
            onTransitionEnd={() => {
              if (isTop) setShownId(id);
            }}
            className={cn(
              "absolute inset-0 size-full border-0 motion-safe:transition-opacity motion-safe:duration-300",
              visible ? "opacity-100" : "opacity-0",
            )}
          />
        );
      })}
    </div>
  );
}
