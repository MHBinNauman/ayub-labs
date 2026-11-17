import { cn } from "@/lib/cn";

/**
 * A top-level item in the desktop nav strip. Active = navy text with a 2px
 * red underline; the underline is a pseudo-element so the label never shifts.
 * `expanded` (an open menu) gets the hover look without claiming to be active.
 */
export function navItemClass(active: boolean, expanded = false): string {
  return cn(
    "relative inline-flex h-full items-center gap-1 px-4 text-[0.9375rem] font-semibold transition-colors",
    "after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue",
    active
      ? "text-navy after:bg-brand-red"
      : expanded
        ? "text-navy after:bg-navy/25"
        : "text-ink after:bg-transparent hover:text-navy hover:after:bg-navy/25",
  );
}
