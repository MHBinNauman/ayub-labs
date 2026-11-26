"use client";

import { inView } from "motion";
import { animate } from "motion/mini";
import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait after entering view, for staggering siblings. */
  delay?: number;
  className?: string;
};

/**
 * Fades content up 12px the first time it scrolls into view.
 *
 * The server HTML is fully visible. Only after hydration, and only for
 * elements still below the fold, is the content hidden and then animated in.
 * So nothing is ever invisible without JavaScript, content already on screen
 * (including the LCP element) is never touched, and visitors who prefer
 * reduced motion get no animation at all.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.style.opacity = "0";
    element.style.transform = "translateY(12px)";

    const reset = () => {
      element.style.opacity = "";
      element.style.transform = "";
    };

    // inView stops observing after the first entry, so this runs once.
    const stop = inView(
      element,
      () => {
        animate(
          element,
          { opacity: 1, transform: "translateY(0px)" },
          { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
        ).then(reset);
      },
      { amount: 0.15 },
    );

    return () => {
      stop();
      reset();
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
