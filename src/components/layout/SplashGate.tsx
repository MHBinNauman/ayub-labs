"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { SPLASH_EVENT } from "@/lib/splash";

function subscribe(onChange: () => void) {
  window.addEventListener(SPLASH_EVENT, onChange);
  return () => window.removeEventListener(SPLASH_EVENT, onChange);
}

function isGone(): boolean {
  const state = document.documentElement.dataset.splash;
  return state === "skip" || state === "done";
}

const isGoneOnServer = () => false;

/**
 * Takes the splash out of the DOM once it is over. Its markup is rendered on
 * the server and only passes through here: the inline script may finish
 * before React hydrates, and deleting the nodes itself would be a hydration
 * error. Until this runs, CSS hides the finished splash.
 */
export function SplashGate({ children }: { children: ReactNode }) {
  const gone = useSyncExternalStore(subscribe, isGone, isGoneOnServer);
  return gone ? null : children;
}
