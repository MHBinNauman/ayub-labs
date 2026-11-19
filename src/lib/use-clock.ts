/** A shared minute clock for client components. */
import { useSyncExternalStore } from "react";

export const MINUTE = 60_000;

/* One interval however many components on the page use the clock. */
function subscribe(onChange: () => void): () => void {
  const interval = setInterval(onChange, MINUTE);
  // A tab left in the background catches up as soon as it is shown again.
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/** The current minute. Stable within a minute, so React re-renders once a minute at most. */
const getMinute = () => Math.floor(Date.now() / MINUTE);
/** Unknown on the server: pages are prerendered, so "now" is only known in the browser. */
const getServerMinute = () => null;

/**
 * The current time, rounded down to the minute, or null during prerender and
 * hydration (so server and client HTML match). Timezone-free: pass it to the
 * Karachi-aware helpers in hours.ts.
 */
export function useMinuteClock(): Date | null {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  return minute === null ? null : new Date(minute * MINUTE);
}
