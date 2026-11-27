import type { ComponentPropsWithoutRef, Ref } from "react";
import { cx } from "@/lib/cx";

type ScrollRowProps = ComponentPropsWithoutRef<"div"> & {
  /** Classes for the outer frame: margins and bleed (e.g. -mx-4). */
  frameClassName?: string;
  ref?: Ref<HTMLDivElement>;
};

/**
 * A row that scrolls sideways when it doesn't fit (tab bars, chip lists),
 * snapping each item to the start edge, with no visible scrollbar.
 *
 * Edge fades show there is more to see: the start fade appears once the
 * row has scrolled, and the end fade goes once it reaches the end. Their
 * opacity follows the row's scroll timeline (globals.css .scroll-fade), so
 * no JavaScript runs; when the row fits, the timeline is inactive and both
 * stay hidden. Without scroll timelines there are no fades. Set --fade-bg on
 * the frame to the surface colour behind the row (white by default).
 *
 * Extra props (role, aria-label, …) go to the scrolling element.
 */
export function ScrollRow({
  frameClassName,
  className,
  children,
  ref,
  ...props
}: ScrollRowProps) {
  return (
    <div className={cx("scroll-row-frame", frameClassName)}>
      <div ref={ref} {...props} className={cx("scroll-row", className)}>
        {children}
      </div>
      <span aria-hidden="true" className="scroll-fade scroll-fade-start" />
      <span aria-hidden="true" className="scroll-fade scroll-fade-end" />
    </div>
  );
}

/**
 * Scrolls the row holding `item` sideways so the item sits at its start
 * edge, if it is not already fully in view. Never scrolls the page.
 */
export function revealInRow(item: HTMLElement) {
  const row = item.closest<HTMLElement>(".scroll-row");
  if (!row) return;
  const pad = parseFloat(getComputedStyle(row).scrollPaddingInlineStart) || 0;
  const rowBox = row.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  if (box.left - pad >= rowBox.left && box.right + pad <= rowBox.right) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  row.scrollTo({
    left: row.scrollLeft + box.left - rowBox.left - pad,
    behavior: reduce ? "auto" : "smooth",
  });
}
