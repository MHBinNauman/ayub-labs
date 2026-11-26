"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * "Back to top", bottom-left so it never meets the WhatsApp button on the
 * right. It appears once the visitor is 1.5 screens down: a sentinel 150vh
 * tall sits at the top of the page, and an IntersectionObserver shows the
 * button when it has scrolled out of view, so there is no scroll listener.
 *
 * Hidden, it is `invisible` as well as transparent, so it is out of the tab
 * order. It fades and rises in; under reduced motion it simply appears, and
 * the jump to the top is instant. Focus moves to <main>, as the skip link
 * does, so keyboard users continue from the top.
 */
export function ScrollToTop({ mainId = "main" }: { mainId?: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) =>
      setShown(!entry.isIntersecting),
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  function toTop() {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById(mainId)?.focus({ preventScroll: true });
  }

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        // max-h-full: on a page shorter than 150vh it must not add scroll.
        className="pointer-events-none absolute inset-x-0 top-0 h-[150vh] max-h-full"
      />
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        data-shown={shown || undefined}
        className={cn(
          "vt-to-top fixed bottom-20 left-4 z-30 grid size-12 place-items-center rounded-full bg-navy text-white shadow-card-hover hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:left-6 lg:bottom-6",
          "motion-safe:transition-[opacity,translate,visibility,background-color] motion-safe:duration-200 motion-safe:ease-house",
          shown
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-2 opacity-0",
        )}
      >
        <ArrowUp aria-hidden="true" className="size-5" />
      </button>
    </>
  );
}
