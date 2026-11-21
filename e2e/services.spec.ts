import { expect, test, type Page } from "@playwright/test";
import { branches, services } from "../src/data/site-data";

const results = (page: Page) =>
  page.getByRole("tabpanel").getByRole("listitem");

/** Opens /services (or a variant) and waits until the search island is interactive. */
async function openServices(page: Page, path = "/services") {
  await page.goto(path);
  await page.locator("main [data-hydrated]").waitFor();
}

test.describe("/services without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("static HTML lists every service", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Services",
    );
    for (const service of services) {
      await expect(
        page.getByRole("link", { name: service.name, exact: true }).first(),
      ).toBeVisible();
    }
  });
});

test.describe("/services search and filters", () => {
  test("typing filters the grid and syncs ?q=", async ({ page }) => {
    await openServices(page, "/services");
    await expect(results(page)).toHaveCount(services.length);
    await page
      .getByRole("searchbox", { name: "Search services" })
      .fill("doppler");
    await expect(page).toHaveURL(/[?&]q=doppler/);
    await expect(
      page
        .getByRole("tabpanel")
        .getByRole("link", { name: "Ultrasound & Doppler" }),
    ).toBeVisible();
    await expect(results(page)).not.toHaveCount(services.length);

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page).not.toHaveURL(/q=/);
    await expect(results(page)).toHaveCount(services.length);
  });

  test("fuzzy search loads on demand and tolerates typos", async ({ page }) => {
    // The instant substring filter cannot match a misspelling, so finding
    // the service proves fuse.js was fetched after the first keystroke.
    await openServices(page);
    await page.getByRole("searchbox").fill("haematolgy");
    await expect(
      page
        .getByRole("tabpanel")
        .getByRole("link", { name: "Haematology", exact: true }),
    ).toBeVisible();
  });

  test("a category tab syncs ?category= and Back undoes it", async ({
    page,
  }) => {
    await openServices(page, "/services");
    await page.getByRole("tab", { name: /Diagnostics/ }).click();
    await expect(page).toHaveURL(/[?&]category=diagnostics/);
    await expect(results(page)).toHaveCount(
      services.filter((s) => s.category === "diagnostics").length,
    );

    await page.goBack();
    await expect(page).not.toHaveURL(/category=/);
    await expect(results(page)).toHaveCount(services.length);
  });

  test("deep links restore the filter", async ({ page }) => {
    await openServices(page, "/services?category=diagnostics&q=ecg");
    await expect(
      page.getByRole("tab", { name: /Diagnostics/ }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("searchbox")).toHaveValue("ecg");
    await expect(
      page
        .getByRole("tabpanel")
        .getByRole("link", { name: "ECG", exact: true }),
    ).toBeVisible();
  });

  test("an unknown category falls back to All", async ({ page }) => {
    await openServices(page, "/services?category=nonsense");
    await expect(page.getByRole("tab", { name: /^All/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(results(page)).toHaveCount(services.length);
  });

  test("no matches offers a WhatsApp question with the search text", async ({
    page,
  }) => {
    await openServices(page, "/services");
    await page.getByRole("searchbox").fill("zzqxv");
    await expect(page.getByText("No services match “zzqxv”")).toBeVisible();
    const ask = page.getByRole("link", { name: "Can't find it? Ask us" });
    const href = await ask.getAttribute("href");
    expect(decodeURIComponent(href ?? "")).toContain('"zzqxv"');
  });

  test("tabs are keyboard operable", async ({ page }) => {
    await openServices(page, "/services");
    await page.getByRole("tab", { name: /^All/ }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /Laboratory/ })).toBeFocused();
    await expect(page).toHaveURL(/category=laboratory/);
  });
});

test.describe("/services/[slug]", () => {
  test("service page: heading, CTA, branches, related, structured data", async ({
    page,
  }) => {
    await page.goto("/services/ecg");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ECG");
    await expect(page).toHaveTitle(/^ECG \| /);

    // No test list yet → WhatsApp CTA prefilled with the service name.
    const ask = page.getByRole("link", { name: "Ask on WhatsApp" });
    expect(
      decodeURIComponent((await ask.getAttribute("href")) ?? ""),
    ).toContain("ECG");

    const visit = page.getByRole("complementary", { name: "Visit or call" });
    for (const branch of branches) {
      await expect(
        visit.getByRole("link", { name: `Directions to ${branch.name}` }),
      ).toBeVisible();
    }

    await expect(
      page.getByRole("region", { name: /More in Diagnostics/ }),
    ).toContainText("Ultrasound & Doppler");

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const types = blocks.map((text) => JSON.parse(text)["@type"]);
    expect(types).toEqual(
      expect.arrayContaining(["BreadcrumbList", "MedicalTest"]),
    );
  });

  test("clinics get breadcrumbs but no test/procedure markup", async ({
    page,
  }) => {
    await page.goto("/services/dermatology");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    // Only the site-wide organization and the breadcrumbs; no MedicalTest.
    expect(blocks.map((text) => JSON.parse(text)["@type"]).sort()).toEqual([
      "BreadcrumbList",
      "MedicalOrganization",
    ]);
  });

  test("a single-service category hides the related section", async ({
    page,
  }) => {
    await page.goto("/services/pharmacy");
    await expect(page.getByRole("heading", { name: /^More in/ })).toHaveCount(
      0,
    );
  });

  test("unknown slugs are a real 404", async ({ page }) => {
    const response = await page.goto("/services/not-a-service");
    expect(response?.status()).toBe(404);
  });

  test("the draft-copy notice never reaches a production build", async ({
    page,
  }) => {
    await page.goto("/services/ecg");
    await expect(page.getByText("Draft copy")).toHaveCount(0);
  });
});
