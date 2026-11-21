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
