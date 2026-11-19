/**
 * The page's query string as React state, for client components only.
 *
 * Why not useSearchParams: under Cache Components a component that calls it
 * renders only in the browser, inside <Suspense>. The static HTML then holds
 * the fallback, and React swaps in a second instance after hydration, so a
 * visitor who has already focused a control or started typing loses focus
 * and keystrokes. Reading window.location through useSyncExternalStore keeps
 * one instance: it hydrates from the static HTML (server snapshot = no
 * params, matching the prerender) and then re-renders with the real URL.
 * Every component using this hook shares one store, so separate islands on
 * a page stay in sync without passing state around.
 */
import { useSyncExternalStore } from "react";

const URL_CHANGE = "app:url-params-change";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange); // Back / Forward
  window.addEventListener(URL_CHANGE, onChange); // setUrlParams below
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(URL_CHANGE, onChange);
  };
}
const getSearch = () => window.location.search;
const getServerSearch = () => "";

/** Current query parameters. Empty during prerender and hydration. */
export function useUrlParams(): URLSearchParams {
  return new URLSearchParams(
    useSyncExternalStore(subscribe, getSearch, getServerSearch),
  );
}

/**
 * Shallow URL update through the native history API (no navigation). A
 * null or empty value removes the parameter. `push` adds a history entry so
 * Back undoes the change; otherwise the current entry is replaced.
 */
export function setUrlParams(
  updates: Record<string, string | null>,
  { push }: { push: boolean },
): void {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(updates)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const search = params.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  if (push) window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(URL_CHANGE));
}
