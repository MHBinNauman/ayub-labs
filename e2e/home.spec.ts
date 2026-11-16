import { expect, test } from "@playwright/test";
import { brand } from "../src/data/site-data";

test("home page renders the brand name", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(brand.displayName);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    brand.displayName,
  );
});
