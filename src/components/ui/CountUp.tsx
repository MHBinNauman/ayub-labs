"use client";

import { cubicBezier, inView } from "motion";
import { useEffect, useRef } from "react";

const DURATION_MS = 600;
const ease = cubicBezier(0.22, 1, 0.36, 1);

type CountUpProps = {
  value: number;
  /** Text after the number, e.g. "+ years". */
  suffix?: string;
};

/**
 * A number that counts up from 0 the first time it scrolls into view.
 *
 * The server HTML holds the final value, and screen readers always hear only
 * that (the counting copy is aria-hidden). Like Reveal, it only animates when
 * it starts below the fold and the visitor has not asked for reduced motion,
 * so a number already on screen never flickers. Runs once.
 */
export function CountUp({ value, suffix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    const final = String(value);
    let frame = 0;
    element.textContent = "0";

    const stop = inView(
      element,
      () => {
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          element.textContent = String(Math.round(ease(progress) * value));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { amount: 0.5 },
    );

    return () => {
      stop();
      cancelAnimationFrame(frame);
      element.textContent = final;
    };
  }, [value]);

  return (
    <>
      <span aria-hidden="true">
        <span ref={ref} className="tabular-nums">
          {value}
        </span>
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </>
  );
}
