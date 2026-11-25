import { expect, test, type Locator, type Page } from "@playwright/test";
import { features } from "../src/data/site-data";

// Written out here, not read from navItems: the order is fixed (CLAUDE.md),
// so a reordered list must fail these tests.
const EXPECTED = features.testDirectory
  ? [
      ["Home", "/"],
      ["About", "/about"],
      ["Services", "/services"],
      ["Tests & prices", "/tests"],
      ["Reports", "/reports"],
      ["Locations", "/locations"],
      ["Contact", "/contact"],
    ]
  : [
      ["Home", "/"],
      ["About", "/about"],
      ["Services", "/services"],
      ["Reports", "/reports"],
      ["Locations", "/locations"],
      ["Contact", "/contact"],
    ];
const LABELS = EXPECTED.map(([label]) => label);

/**
 * The top-level entries of the header nav: the nav strip on desktop, the
 * opened drawer on mobile. Services is a button (desktop) or a summary
 * (mobile); the service links inside its menu are not top-level.
 */
async function headerEntries(page: Page, isMobile: boolean): Promise<Locator> {
  if (isMobile) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
  }
  const root = isMobile ? page.getByRole("dialog", { name: "Menu" }) : page;
  return root
    .getByRole("navigation", { name: "Main" })
    .locator("ul")
    .first()
    .locator("> li > a, > li > button, > li > details > summary");
}

test.describe("navigation order", () => {
  test("header", async ({ page, isMobile }) => {
    await page.goto("/");
    const entries = await headerEntries(page, isMobile);
    await expect(entries).toHaveText(LABELS);

    for (const [index, [label, href]] of EXPECTED.entries()) {
      if (label === "Services") continue; // opens its menu instead
      await expect(entries.nth(index)).toHaveAttribute("href", href);
    }
  });

  test("footer quick links", async ({ page }) => {
    await page.goto("/");
    const links = page
      .locator("footer")
      .getByRole("region", { name: "Quick links" })
      .getByRole("link");
    await expect(links).toHaveText(LABELS);

    for (const [index, [, href]] of EXPECTED.entries()) {
      await expect(links.nth(index)).toHaveAttribute("href", href);
    }
  });
});

test.describe("active section", () => {
  const cases: { path: string; active: string; current: "page" | "true" }[] = [
    // Services opens a menu rather than being a link, so it is never "page".
    { path: "/services", active: "Services", current: "true" },
    { path: "/services/ecg", active: "Services", current: "true" },
    { path: "/locations", active: "Locations", current: "page" },
    { path: "/locations/f8-islamabad", active: "Locations", current: "true" },
    { path: "/reports", active: "Reports", current: "page" },
  ];

  for (const { path, active, current } of cases) {
    test(`${path} marks only ${active}`, async ({ page, isMobile }) => {
      await page.goto(path);
      const entries = await headerEntries(page, isMobile);
      await expect(entries).toHaveText(LABELS);

      for (const [index, label] of LABELS.entries()) {
        const entry = entries.nth(index);
        if (label === active) {
          await expect(entry).toHaveAttribute("aria-current", current);
        } else {
          await expect(entry).not.toHaveAttribute("aria-current");
        }
      }
    });
  }
});
