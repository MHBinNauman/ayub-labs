"use client";

import { inView } from "motion";
import { animate } from "motion/mini";
import { useEffect, useRef, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.5;
const OFFSET = "translateY(16px)";
/** Share of an item that must be in view before it reveals. */
const AMOUNT = 0.2;

/** Seconds between staggered items, site-wide. */
export const REVEAL_STAGGER = 0.08;

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait after entering view. */
  delay?: number;
  /**
   * Seconds between items. Without it the whole block reveals as one. With
   * it, each item reveals in turn: the direct children, except that a child
   * containing elements marked `data-reveal` is replaced by those elements
   * (so a grid's cards stagger one by one).
   */
  stagger?: number;
  className?: string;
};

/** The elements a staggered Reveal animates, in DOM order. */
export function revealItems(root: Element): HTMLElement[] {
  const items: HTMLElement[] = [];
  for (const child of Array.from(root.children) as HTMLElement[]) {
    const marked = Array.from(
      child.querySelectorAll<HTMLElement>("[data-reveal]"),
    ).filter((element) => {
      // Only the outermost marked elements inside this child.
      const outer = element.parentElement?.closest("[data-reveal]");
      return !outer || !child.contains(outer);
    });
    if (marked.length > 0) items.push(...marked);
    else items.push(child);
  }
  return items;
}

/**
 * Fades content up 16px the first time it scrolls into view (a fifth of it
 * visible), once.
 *
 * The server HTML is fully visible. Only after hydration, and only for items
 * still below the fold, is content hidden and then animated in. So nothing is
 * ever invisible without JavaScript, content already on screen (including the
 * LCP element) is never touched, and visitors who prefer reduced motion get
 * no animation at all.
 *
 * Each item is watched on its own, so a long section never reveals what is
 * still off screen; items that come into view in the same frame are
 * staggered in DOM order.
 */
export function Reveal({
  children,
  delay = 0,
  stagger,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = stagger === undefined ? [root] : revealItems(root);
    const pending = targets.filter(
      (element) => element.getBoundingClientRect().top >= window.innerHeight,
    );
    if (pending.length === 0) return;

    const reset = (element: HTMLElement) => {
      element.style.opacity = "";
      element.style.transform = "";
    };
    for (const element of pending) {
      element.style.opacity = "0";
      element.style.transform = OFFSET;
    }

    let batch: HTMLElement[] = [];
    let frame = 0;
    const flush = () => {
      frame = 0;
      batch
        .sort((a, b) => pending.indexOf(a) - pending.indexOf(b))
        .forEach((element, index) => {
          animate(
            element,
            { opacity: 1, transform: "translateY(0px)" },
            {
              duration: DURATION,
              delay: delay + index * (stagger ?? 0),
              ease: EASE,
            },
          ).then(() => reset(element));
        });
      batch = [];
    };

    // inView stops watching an element after its first entry, so each runs once.
    const stops = pending.map((element) =>
      inView(
        element,
        () => {
          batch.push(element);
          if (!frame) frame = requestAnimationFrame(flush);
        },
        // An item taller than five screens could never be a fifth visible.
        {
          amount: Math.min(
            AMOUNT,
            (window.innerHeight * AMOUNT) / Math.max(element.offsetHeight, 1),
          ),
        },
      ),
    );

    return () => {
      stops.forEach((stop) => stop());
      cancelAnimationFrame(frame);
      pending.forEach(reset);
    };
  }, [delay, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
