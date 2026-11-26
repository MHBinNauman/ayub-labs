import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import sitemap from "../src/app/sitemap";

// Runs against the production build (see playwright.config.ts).

/** Every public page (from the sitemap, so new pages are covered) plus the 404. */
const paths = [
  ...sitemap().map((entry) => new URL(entry.url).pathname),
  "/this-page-does-not-exist",
];

/** Serious and critical WCAG 2.1 A/AA violations, formatted for the report. */
async function seriousViolations(page: Page): Promise<string[]> {
  // Scan the page itself, not the splash laid over it.
  await expect(page.locator(".splash")).toHaveCount(0);
  // Contrast is measured on finished frames: a UI fade caught mid-way (the
  // mobile drawer's items, a crossfade) would read as low contrast. Only
  // short animations are waited for; the hero's slow zoom and the
  // scroll-driven banner parallax never settle and don't change colours.
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      if (animation.playState !== "running") return true;
      if (animation.timeline !== document.timeline) return true;
      const duration = Number(animation.effect?.getTiming().duration);
      return !(duration <= 1000);
    }),
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // Google's map iframe is third-party content we cannot change.
    .exclude("iframe[src*='google.com/maps']")
    .analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map(
      (v) =>
        `${v.impact} ${v.id}: ${v.help} (${v.helpUrl})\n    ${v.nodes
          .slice(0, 5)
          .map((node) => node.target.join(" "))
          .join("\n    ")}`,
    );
}

test.describe("axe: no serious or critical violations", () => {
  for (const path of paths) {
    test(path, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await seriousViolations(page)).toEqual([]);
    });
  }

  test("the splash screen", async ({ page }) => {
    // Its script (the first caller of matchMedia) fails, so it stays up.
    await page.addInitScript(() => {
      const matchMedia = window.matchMedia;
      window.matchMedia = () => {
        window.matchMedia = matchMedia;
        throw new Error("blocked");
      };
    });
    await page.goto("/");
    const splash = page.locator(".splash");
    await expect(splash).toBeVisible();
    const results = await new AxeBuilder({ page }).include(".splash").analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test("with the mobile menu open", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the drawer is the phone navigation");
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("with the services mega menu open", async ({ page, isMobile }) => {
    test.skip(isMobile, "the mega menu is desktop navigation");
    await page.goto("/", { waitUntil: "networkidle" });
    const trigger = page.getByRole("button", { name: "Services" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await seriousViolations(page)).toEqual([]);
  });
});
