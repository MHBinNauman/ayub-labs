/**
 * Joins class names without Tailwind conflict merging: clsx only.
 *
 * For client components and anything they import (Badge, Container,
 * ScrollRow). `cn()` pulls tailwind-merge (~8.5 KB gzip) into the browser
 * bundle; this does not. The price: classes passed in must not conflict
 * with the component's own (no `px-4` + `px-5`). Give a component an
 * explicit prop for a default it should drop instead (see CategoryTabs
 * `bleed` and `rowClassName`). Server-only components keep `cn()`.
 */
export { clsx as cx } from "clsx";
