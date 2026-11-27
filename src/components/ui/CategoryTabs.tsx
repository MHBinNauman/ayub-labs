"use client";

import { useRef, type KeyboardEvent } from "react";
import { cx } from "@/lib/cx";
import { revealInRow, ScrollRow } from "./ScrollRow";

/** `count` is shown as a pill after the label; leave it out to show none. */
export type CategoryTab = { id: string; label: string; count?: number };

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
  /** Extra classes for the frame, e.g. its top margin. */
  className?: string;
  /**
   * On phones the row bleeds to the screen edges (-mx-4). Turn off inside a
   * padded card, and give the card's own padding as `rowClassName`.
   */
  bleed?: boolean;
  /** Side padding of the scrolling row. Replaces the default, not merged. */
  rowClassName?: string;
};

export function categoryTabId(idPrefix: string, tabId: string): string {
  return `${idPrefix}-tab-${tabId}`;
}

/**
 * Pill-style tab bar following the WAI-ARIA tabs pattern: only the selected
 * tab is in the Tab order (roving tabindex); Left/Right/Home/End move and
 * select. Each tab can show how many items it holds. Controlled: the parent owns
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
  bleed = true,
  rowClassName = "scroll-px-4 px-4 sm:scroll-px-0 sm:px-0",
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
    const node = tabRefs.current.get(nextTab.id);
    node?.focus();
    if (node) revealInRow(node);
  }

  return (
    // Phones: one row that scrolls sideways, bleeding to the screen edges.
    // From sm the pills wrap, so the row never scrolls there.
    <ScrollRow
      role="tablist"
      aria-label={label}
      frameClassName={cx(bleed && "-mx-4 sm:mx-0", className)}
      className={cx("flex gap-2 pb-1 sm:flex-wrap", rowClassName)}
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
            onClick={(event) => {
              revealInRow(event.currentTarget);
              onSelect(tab.id);
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
              selected
                ? "border-navy bg-navy text-white"
                : "border-ink/15 bg-white text-ink hover:border-navy hover:text-navy",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cx(
                  "ml-2 rounded-full px-1.5 text-sm",
                  selected ? "bg-white/20" : "bg-surface text-muted",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </ScrollRow>
  );
}
