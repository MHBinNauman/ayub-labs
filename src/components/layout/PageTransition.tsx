"use client";

import { animate } from "motion/mini";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useHydrated } from "@/lib/use-hydrated";

const RUNNING = '[data-page-transition="running"]';

/**
 * Fades a page in with an 8px rise when the visitor navigates to it. Used by
 * the template.tsx files.
 *
 * The server HTML is always fully visible: the animation is set up in a
 * layout effect (before paint), and only for pages reached by navigation,
 * never for the page that was loaded. Next keeps recent pages alive and
 * re-runs effects when one is shown again, so going back animates too.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  // True only for the render that hydrates server HTML, i.e. the first load.
  const isFirstLoad = useRef(!hydrated);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let controls: ReturnType<typeof animate> | undefined;
    let cancelled = false;

    const reset = () => {
      element.dataset.pageTransition = "";
      // A leftover transform would become the frame for position: fixed.
      element.style.opacity = "";
      element.style.transform = "";
    };

    element.dataset.pageTransition = "running";
    // Still before paint, but after every layout effect of this navigation,
    // so a template nested in one that is also entering can stand aside.
    queueMicrotask(() => {
      if (cancelled) return;
      if (element.parentElement?.closest(RUNNING)) {
        reset();
        return;
      }
      controls = animate(
        element,
        {
          opacity: [0, 1],
          transform: ["translateY(8px)", "translateY(0px)"],
        },
        { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      );
      controls.then(() => {
        if (!cancelled) reset();
      });
    });

    return () => {
      cancelled = true;
      controls?.cancel();
      reset();
    };
  }, []);

  return (
    <div ref={ref} data-page-transition="">
      {children}
    </div>
  );
}
