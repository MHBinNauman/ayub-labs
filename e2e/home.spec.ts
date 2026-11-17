import { expect, test } from "@playwright/test";
import { brand, branches, services } from "../src/data/site-data";

test("home page has the SEO title and hero heading", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(
    `${brand.displayName} | Diagnostic Lab in Rawalpindi & Islamabad`,
  );
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText("Reliable diagnostics.");
  await expect(h1).toContainText("In quality we believe.");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /since 2016/,
  );
});

test("hidden sections stay hidden while their data is empty", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Doctors" })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "What patients say" }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Key figures")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/TODO|Lorem|0 ?K\b/);
});

test("status chip goes live after hydration", async ({ page }) => {
  // Tuesday 1:00 PM in Karachi: open.
  await page.clock.setFixedTime(new Date("2026-11-17T08:00:00Z"));
  await page.goto("/");
  const hero = page.locator("section", { has: page.locator("#hero-heading") });
  await expect(hero.getByText("Open now · closes 9:00 PM")).toBeVisible();
});

test("services tabs filter the grid", async ({ page }) => {
  await page.goto("/");
  const tabs = page.getByRole("tablist", { name: "Service categories" });
  const panel = page.getByRole("tabpanel");
  await expect(panel.getByRole("listitem")).toHaveCount(services.length);

  await tabs.getByRole("tab", { name: /Diagnostics/ }).click();
  const diagnostics = services.filter((s) => s.category === "diagnostics");
  await expect(panel.getByRole("listitem")).toHaveCount(diagnostics.length);
  await expect(tabs.getByRole("tab", { name: /Diagnostics/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  // Arrow keys move selection, roving tabindex.
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: /Clinics/ })).toBeFocused();
});

test("one location card per branch with directions and call", async ({
  page,
}) => {
  await page.goto("/");
  for (const branch of branches) {
    await expect(
      page.getByRole("link", { name: `Directions to ${branch.name}` }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: `Call ${branch.name}` }),
    ).toBeVisible();
  }
});

test.describe("maps", () => {
  test("phones load a map only on request", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    await expect(page.locator("iframe")).toHaveCount(0);
    await page
      .getByRole("button", { name: new RegExp(branches[0].name) })
      .click();
    await expect(
      page.locator(`iframe[title="Map of ${branches[0].name}"]`),
    ).toHaveAttribute("loading", "lazy");
  });

  test("desktop renders lazy iframes directly", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("/");
    await expect(page.locator('iframe[loading="lazy"]')).toHaveCount(
      branches.length,
    );
  });
});
