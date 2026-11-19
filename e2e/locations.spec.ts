import { expect, test, type Page } from "@playwright/test";
import { branches } from "../src/data/site-data";

const [saddar, f8] = branches;

// Keep the suite offline and fast: Google Maps iframes get a blank page
// (they still fire `load`, which the map crossfade waits for).
test.beforeEach(async ({ page }) => {
  await page.route("https://www.google.com/maps**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<html></html>" }),
  );
});

async function openFinder(page: Page, path = "/locations") {
  await page.goto(path);
  await page.locator("main [data-hydrated]").waitFor();
}

/** The map the finder currently shows (the top, non-hidden layer). */
const finderMap = (page: Page) =>
  page.locator("#locations-map iframe:not([aria-hidden])");

const card = (page: Page, id: string) => page.locator(`#branch-${id}`);

test.describe("/locations without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("static HTML has every branch card", async ({ page }) => {
    await page.goto("/locations");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Our Branches",
    );
    for (const branch of branches) {
      await expect(
        page.getByRole("heading", { level: 2, name: branch.name }),
      ).toBeVisible();
    }
  });
});

test.describe("/locations finder", () => {
  test("city filter syncs ?city= and filters list and cards", async ({
    page,
    isMobile,
  }) => {
    await openFinder(page);
    await page.getByLabel("City").selectOption("islamabad");
    await expect(page).toHaveURL(/[?&]city=islamabad/);

    const list = page.getByRole("list", { name: "Branches" });
    if (isMobile) {
      // Phones get the select and the cards only.
      await expect(list).toBeHidden();
    } else {
      await expect(list.getByRole("button")).toHaveCount(1);
      await expect(list.getByRole("button", { name: /F-8/ })).toBeVisible();
    }
    await expect(card(page, saddar.id)).toBeHidden();
    await expect(card(page, f8.id)).toBeVisible();

    await page.goBack();
    await expect(page).not.toHaveURL(/city=/);
    await expect(card(page, saddar.id)).toBeVisible();
  });

  test("picking a branch in the list selects and reveals its card", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the branch list is desktop only");
    await openFinder(page);
    await page
      .getByRole("list", { name: "Branches" })
      .getByRole("button", { name: new RegExp(f8.name) })
      .click();
    await expect(page).toHaveURL(new RegExp(`branch=${f8.id}`));
    await expect(card(page, f8.id)).toHaveAttribute("data-selected", "true");
    await expect(card(page, saddar.id)).not.toHaveAttribute("data-selected");
    await expect(card(page, f8.id)).toBeInViewport();
  });

  test("Reset clears the URL", async ({ page }) => {
    await openFinder(page, `/locations?city=islamabad&branch=${f8.id}`);
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page).toHaveURL(/\/locations$/);
    await expect(page.getByLabel("City")).toHaveValue("all");
  });

  test("invalid params fall back to all cities", async ({ page }) => {
    await openFinder(page, "/locations?city=lahore&branch=nope");
    await expect(page.getByLabel("City")).toHaveValue("all");
    await expect(card(page, saddar.id)).toHaveAttribute(
      "data-selected",
      "true",
    );
  });
});

test.describe("/locations map (desktop)", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("map follows the selection, from the list and from a card", async ({
    page,
  }) => {
    await openFinder(page);
    await expect(finderMap(page)).toHaveAttribute(
      "title",
      `Map of ${saddar.name}`,
    );

    await page.getByLabel("City").selectOption("islamabad");
    await expect(finderMap(page)).toHaveAttribute("title", `Map of ${f8.name}`);

    await page.getByRole("button", { name: "Reset" }).click();
    await page
      .getByRole("button", { name: `Show ${f8.name} on the map` })
      .click();
    await expect(page).toHaveURL(new RegExp(`branch=${f8.id}`));
    await expect(finderMap(page)).toHaveAttribute("title", `Map of ${f8.name}`);
    // The old map is dropped once the new one has faded in.
    await expect(page.locator("#locations-map iframe")).toHaveCount(1);
  });

  test("deep link opens the requested branch on the map", async ({ page }) => {
    await openFinder(page, `/locations?branch=${f8.id}`);
    await expect(finderMap(page)).toHaveAttribute("title", `Map of ${f8.name}`);
  });
});

test.describe("/locations maps (mobile)", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("no map loads until a card asks for it", async ({ page }) => {
    await openFinder(page);
    await expect(page.locator("iframe")).toHaveCount(0);
    await card(page, saddar.id)
      .getByRole("button", { name: /Show map/ })
      .click();
    await expect(
      card(page, saddar.id).locator(`iframe[title="Map of ${saddar.name}"]`),
    ).toHaveCount(1);
    await expect(page.locator("iframe")).toHaveCount(1);
  });
});

test.describe("/locations/[id]", () => {
  test("verified branch: hours, today, registrations, structured data", async ({
    page,
  }) => {
    // Tuesday 1:00 PM in Karachi.
    await page.clock.setFixedTime(new Date("2026-11-17T08:00:00Z"));
    await page.goto(`/locations/${saddar.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      saddar.name,
    );

    const hours = page.getByRole("table", { name: /Opening hours/ });
    await expect(hours.getByRole("row")).toHaveCount(7);
    await expect(hours.locator('tr[aria-current="date"]')).toContainText(
      "Tuesday",
    );
    await expect(page.getByText("Open now · closes 9:00 PM")).toBeVisible();

    const registered = page.getByRole("region", { name: "Registered with" });
    await expect(registered).toContainText("Punjab Healthcare Commission");
    await expect(registered).toContainText(
      "Pakistan Nuclear Regulatory Authority",
    );

    const blocks = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).map((text) => JSON.parse(text));
    const business = blocks.find((b) => Array.isArray(b["@type"]));
    expect(business["@type"]).toEqual(["MedicalBusiness", "DiagnosticLab"]);
    expect(business.openingHoursSpecification).toHaveLength(1);
    expect(business).not.toHaveProperty("geo");
  });

  test("unverified branch: hours flagged, no status, no registrations", async ({
    page,
  }) => {
    await page.goto(`/locations/${f8.id}`);
    await expect(page.getByRole("note")).toContainText(
      "Hours not yet confirmed",
    );
    await expect(page.getByText(/Open now|Closed ·/)).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Registered with" }),
    ).toHaveCount(0);

    const blocks = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).map((text) => JSON.parse(text));
    const business = blocks.find((b) => Array.isArray(b["@type"]));
    expect(business).not.toHaveProperty("openingHoursSpecification");
  });

  test("copy address writes it to the clipboard", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "clipboard permissions are Chromium-only",
    );
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`/locations/${saddar.id}`);
    await page.getByRole("button", { name: "Copy address" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    // The OS clipboard may store line breaks as \r\n (Windows).
    expect(copied.replace(/\r\n/g, "\n")).toBe(saddar.addressLines.join("\n"));
  });

  test("unknown ids are a real 404", async ({ page }) => {
    const response = await page.goto("/locations/not-a-branch");
    expect(response?.status()).toBe(404);
  });
});
