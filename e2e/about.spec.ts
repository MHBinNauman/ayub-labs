import { expect, test } from "@playwright/test";
import { brand, registrations } from "../src/data/site-data";

test.describe("/about", () => {
  test("page structure", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      `About ${brand.displayName}`,
    );
    await expect(
      page.getByRole("main").getByText(brand.aboutDraft),
    ).toBeVisible();
    for (const name of [
      "How we got here",
      "Who we are registered with",
      `“${brand.tagline.value}”`,
      "Ready when you are",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
  });

  test("timeline starts at the founding year and ends today", async ({
    page,
  }) => {
    await page.goto("/about");
    const items = page
      .getByRole("region", { name: "How we got here" })
      .getByRole("listitem");
    await expect(items.first()).toContainText(String(brand.foundedYear.value));
    await expect(items.last()).toContainText("Today");
  });

  test("registrations are explained, never called accreditation", async ({
    page,
  }) => {
    await page.goto("/about");
    for (const registration of registrations.filter((r) => r.verified)) {
      await expect(
        page.getByRole("main").getByText(registration.explainer),
      ).toBeVisible();
    }
    await expect(page.locator("main")).not.toContainText(/accredit/i);
  });

  test("hidden sections stay hidden", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "Doctors" })).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/TODO|Lorem|0 ?K\b/);
    await expect(page.getByText("Draft copy.")).toHaveCount(0);
  });
});
