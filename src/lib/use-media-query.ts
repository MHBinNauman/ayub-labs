/** Media-query state for client components. False during prerender and hydration. */
import { useSyncExternalStore } from "react";

/** Tailwind's lg breakpoint. */
export const DESKTOP_QUERY = "(min-width: 64rem)";

function subscribeTo(query: string) {
  return (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  };
}

const subscribeDesktop = subscribeTo(DESKTOP_QUERY);
const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;
/** Media queries are unknown during prerender and hydration. */
const falseOnServer = () => false;

/** True from the lg breakpoint up. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribeDesktop, isDesktop, falseOnServer);
}

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeReducedMotion = subscribeTo(REDUCED_MOTION_QUERY);
const prefersReducedMotion = () =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

/** True when the visitor asks for reduced motion. False during prerender. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    falseOnServer,
  );
}
