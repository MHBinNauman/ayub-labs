import { expect, test, type Page } from "@playwright/test";
import nextConfig from "../next.config";
import sitemap from "../src/app/sitemap";
import { SPLASH_KEY } from "../src/lib/splash";

// Runs against the production build (see playwright.config.ts).
//
// Layout QA at the widths patients actually use, on every page: no sideways
// scroll, 44px tap targets, a 14px type floor, photos no larger than the
// screen needs, and the floating buttons never left covering the end of a
// page.

const paths = [
  ...sitemap().map((entry) => new URL(entry.url).pathname),
  "/this-page-does-not-exist",
];

const viewports = [
  { width: 360, height: 740, dpr: 3, phone: true },
  { width: 375, height: 667, dpr: 2, phone: true },
  { width: 390, height: 844, dpr: 3, phone: true },
  { width: 768, height: 1024, dpr: 2, phone: false },
  { width: 1440, height: 900, dpr: 1, phone: false },
];

const MIN_TARGET = 44;
const MIN_TEXT = 14;
/** Text that may be smaller: legal small print and the logotype. */
const TYPE_EXEMPT = "[data-legal], [data-type-exempt]";

/** Every width next/image can serve, smallest first. */
const imageWidths = (() => {
  const { images } = nextConfig("phase-production-server");
  const device = images?.deviceSizes ?? [];
  const small = images?.imageSizes ?? [16, 32, 48, 64, 96, 128, 256, 384];
  return [...small, ...device].sort((a, b) => a - b);
})();

/** Elements that would block the end of the page if they covered it. */
const FLOATING = ".vt-whatsapp, .vt-to-top";

async function settle(page: Page) {
  await expect(page.locator(".splash")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

test.describe("mobile QA", () => {
  for (const vp of viewports) {
    test.describe(`${vp.width}×${vp.height}`, () => {
      test.use({
        viewport: { width: vp.width, height: vp.height },
        // As on a real phone. Left at the project's Pixel 7 screen (412px),
        // the preload scanner would size 100vw photos for 412px.
        screen: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.dpr,
        isMobile: vp.phone,
        hasTouch: vp.phone,
        // Reveals and fades finish at once, so nothing is measured mid-way.
        reducedMotion: "reduce",
      });

      test.beforeEach(async ({ page }, testInfo) => {
        // Viewports are set here, so one project is enough.
        test.skip(testInfo.project.name !== "mobile", "viewports set per test");
        await page.addInitScript((key) => {
          sessionStorage.setItem(key, "1");
        }, SPLASH_KEY);
      });

      for (const path of paths) {
        test(path, async ({ page }) => {
          await page.goto(path, { waitUntil: "networkidle" });
          await settle(page);

          // 1. No sideways scroll.
          const scroll = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          expect(scroll.scrollWidth, "horizontal scroll").toBe(
            scroll.clientWidth,
          );

          // 2. Tap targets and 3. text size.
          const problems = await page.evaluate(
            ({ minTarget, minText, exempt, floating }) => {
              const out: string[] = [];
              const describe = (el: Element) => {
                const text = (el.textContent ?? "").trim().slice(0, 40);
                const label = el.getAttribute("aria-label");
                return `<${el.tagName.toLowerCase()}> "${label ?? text}"`;
              };
              const shown = (el: Element) => {
                if (
                  !el.checkVisibility({
                    checkOpacity: true,
                    checkVisibilityCSS: true,
                  })
                )
                  return false;
                const rect = el.getBoundingClientRect();
                // Visually hidden (sr-only) content is 1px square.
                return rect.width > 1 && rect.height > 1;
              };

              // Tap targets.
              const controls = document.querySelectorAll<HTMLElement>(
                "a[href], button, summary, select, textarea, input:not([type=hidden]), [role=tab]",
              );
              for (const control of controls) {
                if (control.closest(floating)) continue;
                let target: Element = control;
                // A checkbox's target is its label.
                if (
                  control instanceof HTMLInputElement &&
                  ["checkbox", "radio"].includes(control.type)
                ) {
                  target =
                    control.closest("label") ?? control.labels?.[0] ?? control;
                }
                if (!shown(target)) continue;
                // WCAG's inline exception: a link inside a sentence.
                if (getComputedStyle(control).display === "inline") {
                  const block = control.parentElement?.closest(
                    "p, li, dd, td, address, span",
                  );
                  const own = (control.textContent ?? "").trim().length;
                  const around = (block?.textContent ?? "").trim().length;
                  if (block && around > own) continue;
                }
                const { width, height } = target.getBoundingClientRect();
                if (
                  Math.round(width) < minTarget ||
                  Math.round(height) < minTarget
                ) {
                  out.push(
                    `target ${Math.round(width)}×${Math.round(height)} ${describe(control)}`,
                  );
                }
              }

              // Text size.
              const seen = new Set<Element>();
              const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
              );
              for (
                let node = walker.nextNode();
                node;
                node = walker.nextNode()
              ) {
                if (!node.textContent?.trim()) continue;
                const el = node.parentElement;
                if (!el || seen.has(el)) continue;
                seen.add(el);
                if (el.closest("script, style, noscript, svg, " + exempt))
                  continue;
                if (!shown(el)) continue;
                const size = parseFloat(getComputedStyle(el).fontSize);
                if (size < minText - 0.01) {
                  out.push(`text ${size}px ${describe(el)}`);
                }
              }
              return [...new Set(out)];
            },
            {
              minTarget: MIN_TARGET,
              minText: MIN_TEXT,
              exempt: TYPE_EXEMPT,
              floating: FLOATING,
            },
          );
          expect(problems, "tap targets and text size").toEqual([]);

          // 4. Photos no larger than this screen needs: the served width is
          // at most the smallest configured width that covers the rendered
          // width at this pixel density.
          const oversized = await page.evaluate(
            ({ widths, dpr }) => {
              const out: string[] = [];
              for (const img of document.images) {
                if (!img.complete || !img.currentSrc) continue;
                const url = new URL(img.currentSrc);
                if (url.pathname !== "/_next/image") continue;
                // Photos only. Small fixed-size brand marks (the emblem) are
                // shared with the splash, whose larger copy the browser
                // reuses from cache rather than downloading another.
                if (!url.searchParams.get("url")?.startsWith("/images/"))
                  continue;
                const served = Number(url.searchParams.get("w"));
                const rendered = img.getBoundingClientRect().width;
                if (rendered === 0) continue;
                const needed = rendered * dpr;
                const best =
                  widths.find((width) => width >= needed) ?? widths.at(-1)!;
                if (served > best) {
                  out.push(
                    `${url.searchParams.get("url")}: served ${served}w, ${Math.round(rendered)}px × ${dpr} needs ${best}w`,
                  );
                }
              }
              return out;
            },
            { widths: imageWidths, dpr: vp.dpr },
          );
          expect(oversized, "image widths").toEqual([]);

          // 5. At the very end of the page, the floating buttons cover nothing.
          await page.evaluate(() =>
            window.scrollTo(0, document.documentElement.scrollHeight),
          );
          // Back to top appears on a sentinel; let it land.
          await page.waitForTimeout(100);
          const covered = await page.evaluate((floating) => {
            const buttons = [...document.querySelectorAll(floating)]
              .filter((el) => el.checkVisibility({ checkOpacity: true }))
              .map((el) => el.getBoundingClientRect());
            const out: string[] = [];
            const hits = (rect: DOMRect) =>
              buttons.some(
                (b) =>
                  rect.left < b.right &&
                  b.left < rect.right &&
                  rect.top < b.bottom &&
                  b.top < rect.bottom,
              );
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
            );
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              const el = node.parentElement;
              if (!node.textContent?.trim() || !el || el.closest(floating))
                continue;
              if (!el.checkVisibility({ checkOpacity: true })) continue;
              const range = document.createRange();
              range.selectNodeContents(node);
              for (const rect of range.getClientRects()) {
                if (rect.width > 1 && hits(rect)) {
                  out.push(`"${node.textContent.trim().slice(0, 40)}"`);
                  break;
                }
              }
            }
            for (const control of document.querySelectorAll(
              "a[href], button, summary, input, select, textarea",
            )) {
              if (control.closest(floating)) continue;
              if (!control.checkVisibility({ checkOpacity: true })) continue;
              const rect = control.getBoundingClientRect();
              if (rect.width > 1 && hits(rect)) {
                out.push(`<${control.tagName.toLowerCase()}> covered`);
              }
            }
            return [...new Set(out)];
          }, FLOATING);
          expect(covered, "covered by a floating button").toEqual([]);
        });
      }
    });
  }
});

test.describe("scroll rows on a 360px phone", () => {
  test.skip(({ isMobile }) => !isMobile, "phone layout");
  test.use({
    viewport: { width: 360, height: 740 },
    screen: { width: 360, height: 740 },
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      sessionStorage.setItem(key, "1");
    }, SPLASH_KEY);
  });

  /** Snap type and the two fades' opacity for the row with this label. */
  const rowState = (page: Page, label: string) =>
    page.evaluate((label) => {
      const row = document.querySelector<HTMLElement>(
        `[role=tablist][aria-label="${label}"]`,
      )!;
      const frame = row.parentElement!;
      const opacity = (selector: string) =>
        Number(getComputedStyle(frame.querySelector(selector)!).opacity);
      return {
        overflows: row.scrollWidth > row.clientWidth,
        snap: getComputedStyle(row).scrollSnapType,
        start: opacity(".scroll-fade-start"),
        end: opacity(".scroll-fade-end"),
      };
    }, label);

  test("a row that overflows snaps and fades at the edge with more", async ({
    page,
  }) => {
    await page.goto("/services", { waitUntil: "networkidle" });
    const label = "Service categories";
    expect(await rowState(page, label)).toEqual({
      overflows: true,
      snap: "x mandatory",
      start: 0,
      end: 1,
    });

    await page.evaluate((label) => {
      const row = document.querySelector(
        `[role=tablist][aria-label="${label}"]`,
      )!;
      row.scrollLeft = row.scrollWidth;
    }, label);
    await expect
      .poll(() => rowState(page, label))
      .toMatchObject({ start: 1, end: 0 });
  });

  test("choosing a tab past the edge scrolls it into view", async ({
    page,
  }) => {
    await page.goto("/services", { waitUntil: "networkidle" });
    const row = page.getByRole("tablist", { name: "Service categories" });
    const last = row.getByRole("tab").last();
    await row.getByRole("tab").first().focus();
    await page.keyboard.press("End");
    await expect(last).toBeFocused();
    await expect(last).toBeInViewport({ ratio: 1 });
  });

  test("a row that fits shows no fades", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "networkidle" });
    const state = await rowState(page, "Branches");
    test.skip(state.overflows, "the branch names no longer fit at 360px");
    expect(state).toMatchObject({ start: 0, end: 0 });
  });
});
