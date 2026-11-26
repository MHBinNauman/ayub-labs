import { cn } from "@/lib/cn";

/**
 * A top-level item in the desktop nav strip. Active = navy text with a 2px
 * red underline (<NavUnderline>, a real element so it can slide between
 * items). Hover and `expanded` (an open menu) show a faint navy line, drawn
 * as a pseudo-element so the label never shifts and nothing claims to be
 * active.
 */
export function navItemClass(active: boolean, expanded = false): string {
  return cn(
    "relative inline-flex h-full items-center gap-1 px-4 text-[0.9375rem] font-semibold transition-colors",
    "after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue",
    active
      ? "text-navy after:bg-transparent"
      : expanded
        ? "text-navy after:bg-navy/25"
        : "text-ink after:bg-transparent hover:text-navy hover:after:bg-navy/25",
  );
}

/**
 * Class for the active item's red underline. It carries the
 * `nav-underline` view-transition name (globals.css), so on a page change
 * the browser slides it from the old item to the new one. Render it inside
 * the active item only: the name must be unique on the page.
 */
export const navUnderlineClass =
  "nav-underline pointer-events-none absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand-red";
