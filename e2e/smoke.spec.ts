import { expect, test, type Page } from "@playwright/test";
import { branches, contact, services } from "../src/data/site-data";

// Runs against the production build (see playwright.config.ts).

/** Every phone number and WhatsApp number the site is allowed to link to. */
const allowedTel = new Set([
  contact.mobile.e164,
  contact.landline.e164,
  ...branches.flatMap((branch) => branch.phones),
]);
const allowedWhatsapp = new Set([
  contact.whatsapp.number,
  ...branches.flatMap((branch) => (branch.whatsapp ? [branch.whatsapp] : [])),
]);

const hrefs = (page: Page, selector: string) =>
  page
    .locator(selector)
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    );

test.describe("smoke", () => {
  test("home loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/", { waitUntil: "networkidle" });
    // Hydrated islands (status chip, services tabs) have run by now.
    await page
      .locator("[data-hydrated]")
      .first()
      .waitFor({ state: "attached" });
    expect(errors).toEqual([]);
  });

  test("every navigation link resolves with 200", async ({ page, request }) => {
    await page.goto("/");
    const paths = new Set(
      (
        await hrefs(
          page,
          "header a[href^='/'], footer a[href^='/'], main a[href^='/']",
        )
      )
        .map((href) => href.split("#")[0].split("?")[0])
        .filter(Boolean),
    );
    expect(paths.size).toBeGreaterThan(10);

    const failures: string[] = [];
    for (const path of paths) {
      const response = await request.get(path);
      if (response.status() !== 200)
        failures.push(`${path} → ${response.status()}`);
    }
    expect(failures).toEqual([]);
  });

  test("tel: and WhatsApp links use only numbers from site-data", async ({
    page,
  }) => {
    const pages = [
      "/",
      "/locations",
      "/contact",
      `/services/${services[0].slug}`,
      ...branches.map((branch) => `/locations/${branch.id}`),
    ];
    const seenTel = new Set<string>();
    const seenWhatsapp = new Set<string>();
    const unexpected: string[] = [];

    for (const path of pages) {
      await page.goto(path);
      for (const href of await hrefs(page, "a[href^='tel:']")) {
        const number = href.slice("tel:".length);
        seenTel.add(number);
        if (!allowedTel.has(number)) unexpected.push(`${path}: ${href}`);
      }
      for (const href of await hrefs(page, "a[href*='wa.me/']")) {
        const number = new URL(href).pathname.slice(1);
        seenWhatsapp.add(number);
        if (!allowedWhatsapp.has(number)) unexpected.push(`${path}: ${href}`);
      }
    }

    expect(unexpected).toEqual([]);
    // Both kinds of link really are on these pages.
    expect(seenTel.size).toBeGreaterThan(0);
    expect(seenWhatsapp.size).toBeGreaterThan(0);
    // And every number in site-data is reachable from somewhere.
    for (const number of allowedTel) expect(seenTel).toContain(number);
  });
});
