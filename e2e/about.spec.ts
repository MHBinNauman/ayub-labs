import { expect, test } from "@playwright/test";
import { brand, media, registrations } from "../src/data/site-data";
import { whyChooseItems } from "../src/lib/site";

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
      "Our lab",
      "How we got here",
      "Who we are registered with",
      `“${brand.tagline.value}”`,
      "Ready when you are",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
  });

  test("'Our lab' panel: lab photo, About copy and the facts checklist", async ({
    page,
  }) => {
    await page.goto("/about");
    const section = page.locator("section", {
      has: page.locator("#lab-heading"),
    });
    await expect(
      section.getByRole("heading", { level: 2, name: "Our lab" }),
    ).toBeVisible();
    await expect(
      section.getByRole("img", { name: media.about.lab.alt }),
    ).toBeVisible();
    await expect(
      section.getByRole("heading", { level: 3, name: "Why choose us" }),
    ).toBeVisible();
    await expect(section.getByRole("list").getByRole("listitem")).toHaveCount(
      whyChooseItems.length,
    );
  });

  test("milestones reveal one by one; registration tiles lift", async ({
    page,
  }) => {
    await page.goto("/about");
    const story = page.locator("section", {
      has: page.locator("#story-heading"),
    });
    const milestones = story.getByRole("listitem");
    for (const milestone of await milestones.all()) {
      await expect(milestone).toHaveAttribute("data-reveal");
    }
    const tiles = page
      .locator("section", { has: page.locator("#registrations-heading") })
      .getByRole("listitem");
    for (const tile of await tiles.all()) {
      await expect(tile).toHaveClass(/card-hover/);
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
