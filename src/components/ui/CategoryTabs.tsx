"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export type CategoryTab = { id: string; label: string; count: number };

type CategoryTabsProps = {
  tabs: CategoryTab[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Accessible name for the tab list, e.g. "Service categories". */
  label: string;
  /** Prefix for tab ids, so the panel can point back with aria-labelledby. */
  idPrefix: string;
  /** Id of the single panel every tab controls. */
  controlsId: string;
  className?: string;
};

export function categoryTabId(idPrefix: string, tabId: string): string {
  return `${idPrefix}-tab-${tabId}`;
}

/**
 * Pill-style tab bar following the WAI-ARIA tabs pattern: only the selected
 * tab is in the Tab order (roving tabindex); Left/Right/Home/End move and
 * select. Each tab shows how many items it holds. Controlled: the parent owns
 * the selection, so it can keep it in state or in the URL.
 */
export function CategoryTabs({
  tabs,
  activeId,
  onSelect,
  label,
  idPrefix,
  controlsId,
  className,
}: CategoryTabsProps) {
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    const nextTab = tabs[next];
    onSelect(nextTab.id);
    tabRefs.current.get(nextTab.id)?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0",
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              if (node) tabRefs.current.set(tab.id, node);
              else tabRefs.current.delete(tab.id);
            }}
            type="button"
            role="tab"
            id={categoryTabId(idPrefix, tab.id)}
            aria-selected={selected}
            aria-controls={controlsId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
              selected
                ? "border-navy bg-navy text-white"
                : "border-ink/15 bg-white text-ink hover:border-navy hover:text-navy",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-2 rounded-full px-1.5 text-xs",
                selected ? "bg-white/20" : "bg-surface text-muted",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
