"use client";

import { useId, useState, type ReactNode } from "react";
import { CategoryTabs, categoryTabId } from "@/components/ui/CategoryTabs";
import { cn } from "@/lib/cn";

export type BranchPanel = {
  id: string;
  label: string;
  /** Server-rendered map and contact details for this branch. */
  content: ReactNode;
};

/**
 * Homepage locations card body: one tab per branch over panels that
 * crossfade. Every panel stays in the HTML, stacked in one grid cell, so the
 * card is as tall as the tallest branch and nothing shifts on a switch.
 * Hidden panels are `visibility: hidden` once their fade ends, which takes
 * them out of the tab order and the accessibility tree. Reduced motion swaps
 * instantly. With a single branch there are no tabs.
 */
export function BranchSwitcher({ panels }: { panels: BranchPanel[] }) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(panels[0]?.id);
  if (panels.length === 0) return null;

  const active = panels.find((panel) => panel.id === activeId) ?? panels[0];
  const tabbed = panels.length > 1;
  const panelId = `${baseId}-panel`;

  return (
    <>
      {tabbed && (
        <CategoryTabs
          tabs={panels.map(({ id, label }) => ({ id, label }))}
          activeId={active.id}
          onSelect={setActiveId}
          label="Branches"
          idPrefix={baseId}
          controlsId={panelId}
          className="mx-0 px-5 pt-5 sm:px-6 sm:pt-6"
        />
      )}
      <div
        id={panelId}
        role={tabbed ? "tabpanel" : undefined}
        aria-labelledby={tabbed ? categoryTabId(baseId, active.id) : undefined}
        className={cn("grid", tabbed && "mt-4 sm:mt-5")}
      >
        {panels.map((panel) => {
          const shown = panel.id === active.id;
          return (
            <div
              key={panel.id}
              data-branch={panel.id}
              data-active={shown || undefined}
              className={cn(
                "[grid-area:1/1] motion-safe:transition-[opacity,visibility] motion-safe:duration-300 motion-safe:ease-out",
                shown ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              {panel.content}
            </div>
          );
        })}
      </div>
    </>
  );
}
