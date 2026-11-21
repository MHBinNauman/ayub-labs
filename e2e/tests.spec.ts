import { expect, test } from "@playwright/test";
import { features } from "../src/data/site-data";

// Runs against the production build (see playwright.config.ts).
test.describe("/tests while the directory is switched off", () => {
  test.skip(features.testDirectory, "the test directory is switched on");

  test("is a real 404", async ({ page }) => {
    const response = await page.goto("/tests");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Test directory is switched off")).toHaveCount(
      0,
    );
  });

  test("is not linked from the navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/tests"]')).toHaveCount(0);
  });
});
