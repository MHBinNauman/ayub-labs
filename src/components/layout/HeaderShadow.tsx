"use client";

import { useEffect, useRef } from "react";

/**
 * Marks the site header with `data-stuck` once the top bar and header band
 * have scrolled away and only the sticky part remains, so it can show a
 * shadow. An IntersectionObserver on a sentinel the height of the part that
 * scrolls away (h-11 below lg, 40 + 88px from lg), so no scroll listener.
 *
 * Render it before the header, outside any positioned element, so the
 * sentinel is measured from the top of the page.
 */
export function HeaderShadow({ headerId }: { headerId: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const header = document.getElementById(headerId);
    if (!sentinel || !header) return;

    const observer = new IntersectionObserver(([entry]) => {
      header.toggleAttribute("data-stuck", !entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [headerId]);

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-11 lg:h-33"
    />
  );
}
