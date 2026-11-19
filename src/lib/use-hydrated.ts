/**
 * False during prerender and hydration, true once a component runs in the
 * browser. Islands expose it as `data-hydrated` so e2e tests can wait for
 * interactivity instead of racing hydration with a guessed delay.
 */
import { useSyncExternalStore } from "react";

const noSubscription = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

export function useHydrated(): boolean {
  return useSyncExternalStore(noSubscription, getTrue, getFalse);
}
