import type { Page } from "@playwright/test";

type Opened = { url: string; features: string };

/**
 * Replaces window.open so tests can read the URL a composer would open,
 * without leaving the page or reaching wa.me.
 */
export async function captureWindowOpen(page: Page) {
  await page.addInitScript(() => {
    const opened: { url: string; features: string }[] = [];
    (window as unknown as { __opened: typeof opened }).__opened = opened;
    window.open = (url?: string | URL, _target?: string, features?: string) => {
      opened.push({ url: String(url), features: features ?? "" });
      return null;
    };
  });
}

export async function openedUrls(page: Page): Promise<Opened[]> {
  return page.evaluate(
    () => (window as unknown as { __opened: Opened[] }).__opened,
  );
}

/** Records every request the page makes, to prove form data never leaves it. */
export function recordRequests(page: Page): string[] {
  const seen: string[] = [];
  page.on("request", (request) => {
    seen.push(`${request.url()} ${request.postData() ?? ""}`);
  });
  return seen;
}

/** The pre-filled text of a wa.me link. */
export function waText(url: string): string {
  return new URL(url).searchParams.get("text") ?? "";
}
