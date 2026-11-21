import { expect, test } from "@playwright/test";
import { brand, legacyRedirects } from "../src/data/site-data";

// Runs against the production build (see playwright.config.ts).

/** A concrete URL matching each legacy pattern, and where it must land. */
const legacySamples: { from: string; to: string; permanent: boolean }[] = [
  { from: "/home-three", to: "/", permanent: true },
  { from: "/about-us", to: "/about", permanent: true },
  { from: "/contact-us", to: "/contact", permanent: true },
  { from: "/online-report", to: "/reports", permanent: true },
  { from: "/2021/09/14/hello-world", to: "/", permanent: true },
  { from: "/category/uncategorized", to: "/", permanent: true },
  { from: "/tag/sample", to: "/", permanent: true },
  { from: "/wp-admin/index.php", to: "/", permanent: false },
];

test.describe("SEO and platform files", () => {
  // Header and file checks don't depend on the viewport.
  test.skip(({ isMobile }) => isMobile, "checked once, on desktop");

  test("every legacy redirect is covered by a sample", () => {
    expect(legacySamples).toHaveLength(legacyRedirects.length);
  });

  for (const sample of legacySamples) {
    test(`redirects ${sample.from} → ${sample.to}`, async ({ request }) => {
      const response = await request.get(sample.from, { maxRedirects: 0 });
      expect(response.status()).toBe(sample.permanent ? 308 : 307);
      expect(new URL(response.headers().location, "http://x").pathname).toBe(
        sample.to,
      );
    });
  }

  test("security headers are sent", async ({ request }) => {
    const headers = (await request.get("/")).headers();
    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
  });

  test("robots.txt and sitemap.xml", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /styleguide");
    expect(robots).toContain(`Sitemap: https://${brand.domain}/sitemap.xml`);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`<loc>https://${brand.domain}/about</loc>`);
    expect(sitemap).not.toContain("/styleguide");
  });

  test("icons and manifest are served", async ({ request }) => {
    for (const [path, type] of [
      ["/favicon.ico", "image/x-icon"],
      ["/icon", "image/png"],
      ["/apple-icon", "image/png"],
      ["/icons/maskable-512", "image/png"],
      ["/manifest.webmanifest", "application/manifest+json"],
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"], path).toContain(type);
    }
  });

  test("pages carry Open Graph tags and a working og:image", async ({
    page,
    request,
  }) => {
    await page.goto("/services/haematology");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Haematology",
    );
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      "content",
      `Haematology | ${brand.displayName}`,
    );
    const image = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    const response = await request.get(new URL(image!).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("the organization is described on every page", async ({ page }) => {
    for (const path of ["/", "/about"]) {
      await page.goto(path);
      const blocks = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      const types = blocks.map((block) => JSON.parse(block)["@type"]);
      expect(types, path).toContain("MedicalOrganization");
      if (path !== "/") expect(types, path).toContain("BreadcrumbList");
    }
  });
});

test.describe("404 page", () => {
  test("is a real 404 with a service search that works without JS", async ({
    page,
  }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Page not found",
    );
    await expect(
      page.getByRole("main").getByRole("link", { name: "Find a branch" }),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "Contact us" }),
    ).toBeVisible();

    const search = page
      .getByRole("search")
      .getByRole("searchbox", { name: "Search services" });
    await search.fill("ultrasound");
    await search.press("Enter");
    await expect(page).toHaveURL(/\/services\?q=ultrasound$/);
  });
});

test.describe("no Content Security Policy violations", () => {
  for (const path of [
    "/",
    "/services",
    "/locations",
    "/locations/saddar-rawalpindi",
  ]) {
    test(path, async ({ page }) => {
      const violations: string[] = [];
      page.on("console", (message) => {
        if (/Content Security Policy/i.test(message.text())) {
          violations.push(message.text());
        }
      });
      await page.goto(path, { waitUntil: "networkidle" });
      // Open any map posters so the Google iframe actually loads.
      const showMap = page.getByRole("button", { name: /show map/i });
      if (
        await showMap
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        await showMap.first().click();
        await page.waitForLoadState("networkidle");
      }
      expect(violations).toEqual([]);
    });
  }
});
