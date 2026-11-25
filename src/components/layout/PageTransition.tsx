"use client";

import { animate } from "motion/mini";
import { useLayoutEffect, useRef, ViewTransition, type ReactNode } from "react";
import { useHydrated } from "@/lib/use-hydrated";

const RUNNING = '[data-page-transition="running"]';

/** Whether React can run <ViewTransition> here; it needs transition types. */
const hasViewTransitions = () =>
  "startViewTransition" in document &&
  CSS.supports("selector(:active-view-transition-type(page))");

/**
 * What started the navigation in progress. React commits Back and Forward at
 * once, to restore the scroll position, and never animates them, so those get
 * the fade. Unless the browser showed its own animation (a swipe), or cannot
 * tell us (no Navigation API): then a fade could be one animation too many.
 * popstate is no use here: Next's listener runs first, and the new page is
 * committed before ours.
 */
let startedBy: "link" | "history" | null = null;

type NavigateEvent = Event & {
  navigationType: string;
  hasUAVisualTransition?: boolean;
};

if (typeof window !== "undefined") {
  window.addEventListener(
    "click",
    (event) => {
      // Enter on a link is a click too.
      if ((event.target as Element).closest?.("a[href]")) startedBy = "link";
    },
    true,
  );
  if ("navigation" in window) {
    (window.navigation as EventTarget).addEventListener("navigate", (event) => {
      const { navigationType, hasUAVisualTransition } = event as NavigateEvent;
      if (navigationType === "traverse") {
        startedBy = hasUAVisualTransition ? null : "history";
      }
    });
  }
}

/**
 * Blends the old page into the new one when the visitor navigates. Used by
 * the template.tsx files.
 *
 * <ViewTransition> has the browser crossfade a picture of the old page into
 * the new one (globals.css has the timings). When templates are nested, only
 * the outermost one that changes animates. Nothing runs on the page that was
 * loaded, and the server HTML is always fully visible.
 *
 * Back and Forward, and links in browsers without view transitions, get a
 * fade-in of the new page instead, set up in a layout effect so it starts
 * before paint.
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
    const cause = startedBy;
    // After every template of this navigation has read it.
    queueMicrotask(() => (startedBy = null));
    if (cause === null) return;
    if (cause === "link" && hasViewTransitions()) return;
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
          transform: ["translateY(16px)", "translateY(0px)"],
        },
        { duration: 0.4, ease: "easeOut" },
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
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {/* White, so the entering page covers the old one as it fades in. */}
      <div ref={ref} data-page-transition="" className="bg-white">
        {children}
      </div>
    </ViewTransition>
  );
}
