"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { revealInRow, ScrollRow } from "./ScrollRow";

export type TabItem = { id: string; label: string; content: ReactNode };

type TabsProps = {
  tabs: TabItem[];
  /** Accessible name for the tab list, e.g. "Service categories". */
  label: string;
  defaultTabId?: string;
  className?: string;
};

/**
 * Tabs following the WAI-ARIA pattern: only the selected tab is in the Tab
 * order (roving tabindex); Left/Right/Home/End move between tabs and select
 * as they go. Every panel stays in the DOM, so hidden content is still in the
 * HTML for search engines.
 *
 * The tab row scrolls sideways with snap and edge fades when it doesn't
 * fit (ScrollRow); choosing a tab brings it fully into view.
 *
 * Motion (transform and opacity only, none under reduced motion):
 * - One red underline slides to the selected tab. It is a 1px-wide bar moved
 *   and stretched with translateX/scaleX, measured from the tab. Until
 *   hydration, the selected tab draws its own static underline instead.
 * - Panels crossfade. They share one grid cell, so the box is as tall as the
 *   tallest and nothing below shifts; a hidden panel is `visibility: hidden`
 *   once its fade ends, which keeps it out of the tab order and the
 *   accessibility tree.
 */
export function Tabs({ tabs, label, defaultTabId, className }: TabsProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ x: number; width: number }>();

  // Place the underline under the selected tab, and keep it there as the
  // tab list resizes (fonts loading, window resizing, scrolling sideways).
  useLayoutEffect(() => {
    const list = listRef.current;
    const tab = activeId ? tabRefs.current.get(activeId) : undefined;
    if (!list || !tab) return;
    const measure = () =>
      setIndicator({ x: tab.offsetLeft, width: tab.offsetWidth });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    observer.observe(tab);
    return () => observer.disconnect();
  }, [activeId]);

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
    setActiveId(nextTab.id);
    const node = tabRefs.current.get(nextTab.id);
    node?.focus();
    if (node) revealInRow(node);
  }

  return (
    <div className={className}>
      <ScrollRow
        ref={listRef}
        role="tablist"
        aria-label={label}
        // Phones: the row runs to the screen edges, so a tab past the
        // gutter is seen sliding under the fade rather than cut off.
        frameClassName="-mx-4 sm:mx-0"
        className="relative flex scroll-px-4 border-b border-ink/10 px-4 sm:scroll-px-0 sm:px-0"
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
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={(event) => {
                revealInRow(event.currentTarget);
                setActiveId(tab.id);
              }}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "-mb-px min-h-11 shrink-0 border-b-2 px-4 py-2 font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue",
                selected
                  ? // The sliding underline takes over once it is measured.
                    indicator
                    ? "border-transparent text-navy"
                    : "border-brand-red text-navy"
                  : "border-transparent text-muted hover:text-navy",
              )}
            >
              {tab.label}
            </button>
          );
        })}
        {indicator && (
          <span
            aria-hidden="true"
            data-tab-indicator=""
            className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-px origin-left [scroll-snap-align:none] bg-brand-red motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-house"
            style={{
              transform: `translateX(${indicator.x}px) scaleX(${indicator.width})`,
            }}
          />
        )}
      </ScrollRow>

      <div className="grid pt-6">
        {tabs.map((tab) => {
          const shown = tab.id === activeId;
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`${baseId}-panel-${tab.id}`}
              aria-labelledby={`${baseId}-tab-${tab.id}`}
              tabIndex={0}
              data-active={shown || undefined}
              className={cn(
                "[grid-area:1/1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
                "motion-safe:transition-[opacity,visibility] motion-safe:duration-300 motion-safe:ease-out",
                shown ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
