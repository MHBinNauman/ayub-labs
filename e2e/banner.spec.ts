import { expect, test } from "@playwright/test";
import { branches, media } from "../src/data/site-data";
import { SPLASH_KEY } from "../src/lib/splash";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    sessionStorage.setItem(key, "1");
  }, SPLASH_KEY);
});

const pages = [
  { path: "/about", alt: media.banners.about.alt },
  { path: "/services", alt: media.banners.services.alt },
  { path: "/services/haematology", alt: media.services.haematology!.alt },
  { path: "/reports", alt: media.banners.reports.alt },
  { path: "/locations", alt: media.banners.locations.alt },
  { path: `/locations/${branches[0].id}`, alt: media.banners.locations.alt },
  { path: "/contact", alt: media.banners.contact.alt },
];

for (const { path, alt } of pages) {
  test(`${path} opens with the photo banner`, async ({ page }) => {
    await page.goto(path);
    const banner = page.locator("[data-page-banner]");
    await expect(banner).toHaveCount(1);

    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(banner.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await h1.evaluate((el) => getComputedStyle(el).color)).toBe(
      "rgb(255, 255, 255)",
    );

    const crumbs = banner.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(banner.getByRole("img", { name: alt })).toBeVisible();
  });
}

test("the banner photo is the LCP element", async ({ page }) => {
  await page.goto("/about");
  await page.waitForLoadState("load");
  const lcp = await page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as Array<
            PerformanceEntry & { element: Element | null }
          >;
          resolve(
            Boolean(entries.at(-1)?.element?.closest("[data-page-banner]")),
          );
        }).observe({ type: "largest-contentful-paint", buffered: true });
      }),
  );
  expect(lcp).toBe(true);
});

const parallaxName = (page: import("@playwright/test").Page) =>
  page
    .locator("[data-page-banner] .banner-parallax")
    .evaluate((el) => getComputedStyle(el).animationName);

test("parallax runs on desktop only", async ({ page, isMobile }) => {
  await page.goto("/about");
  expect(await parallaxName(page)).toBe(isMobile ? "none" : "banner-parallax");
});

test.describe("under reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the banner photo stays still", async ({ page }) => {
    await page.goto("/about");
    expect(await parallaxName(page)).toBe("none");
  });
});
