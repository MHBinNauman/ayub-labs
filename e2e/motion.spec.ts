import { expect, test, type Page } from "@playwright/test";
import { SPLASH_KEY } from "../src/lib/splash";

/** Skip the splash; these tests are about what sits under it. */
test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    sessionStorage.setItem(key, "1");
  }, SPLASH_KEY);
});

const computed = (page: Page, selector: string, property: string) =>
  page
    .locator(selector)
    .first()
    .evaluate(
      (element, name) => getComputedStyle(element).getPropertyValue(name),
      property,
    );

test.describe("header", () => {
  test("below lg the pinned band compacts and gains a shadow", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "the band only pins below lg");
    await page.goto("/");
    const header = page.locator("header.site-header");
    await expect(header).not.toHaveAttribute("data-stuck");
    await page.mouse.wheel(0, 400);
    await expect(header).toHaveAttribute("data-stuck", "");
    await expect
      .poll(() => computed(page, ".header-logo", "scale"))
      .toBe("0.88");
    await expect
      .poll(() =>
        header.evaluate((el) => getComputedStyle(el, "::after").opacity),
      )
      .toBe("1");
  });

  test("the nav strip blurs what scrolls beneath it", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "desktop nav strip");
    await page.goto("/");
    const filter = await computed(
      page,
      'nav[aria-label="Main"]',
      "backdrop-filter",
    );
    expect(filter).toContain("blur");
  });

  test("one red underline, on the current page's item", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "desktop nav strip");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.locator(".nav-underline")).toHaveCount(1);
    await expect(
      nav.getByRole("link", { name: "Home" }).locator(".nav-underline"),
    ).toHaveCount(1);

    await nav.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(nav.locator(".nav-underline")).toHaveCount(1);
    await expect(
      nav.getByRole("link", { name: "About" }).locator(".nav-underline"),
    ).toHaveCount(1);
  });
});

test.describe("scroll to top", () => {
  test("appears after 1.5 screens, bottom-left, and goes back up", async ({
    page,
  }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Back to top" });
    await expect(button).toBeHidden();

    const height = page.viewportSize()!.height;
    await page.evaluate((y) => window.scrollTo(0, y), height * 1.6);
    await expect(button).toBeVisible();

    const box = (await button.boundingBox())!;
    const fab = (await page
      .getByRole("link", { name: "Chat on WhatsApp" })
      .boundingBox())!;
    expect(box.x + box.width).toBeLessThan(fab.x);
    expect(box.x).toBeLessThan(page.viewportSize()!.width / 2);

    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator("main")).toBeFocused();
    await expect(button).toBeHidden();
  });
});

test.describe("WhatsApp ping", () => {
  test("is armed on the first load of a session only", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-wa-ping", "");
    expect(await computed(page, ".wa-ping", "animation-name")).toBe("wa-ping");
    expect(await computed(page, ".wa-ping", "animation-iteration-count")).toBe(
      "1",
    );

    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute("data-wa-ping");
  });
});

test.describe("mobile drawer", () => {
  test("items follow the panel in, one after another", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "drawer is the phone menu");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    expect(await computed(page, "dialog", "animation-name")).toBe("drawer-in");
    const items = dialog.locator(".drawer-item");
    expect(await items.count()).toBeGreaterThan(1);
    const indices = await items.evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLElement).style.getPropertyValue("--i")),
    );
    expect(indices).toEqual(indices.map((_, i) => String(i)));
  });
});

test.describe("reveals", () => {
  test("sections below the fold end fully visible once scrolled to", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page
      .locator("section", { has: page.locator("#why-heading") })
      .locator("li[data-reveal]")
      .last();
    await card.scrollIntoViewIfNeeded();
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).opacity))
      .toBe("1");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing animates and nothing is hidden", async ({ page }) => {
    await page.goto("/");
    expect(await computed(page, ".wa-ping", "animation-name")).toBe("none");
    // Reveal leaves below-the-fold content untouched.
    const card = page
      .locator("section", { has: page.locator("#why-heading") })
      .locator("li[data-reveal]")
      .last();
    await expect(page.locator("[data-hydrated]").first()).toBeAttached();
    expect(await card.evaluate((el) => (el as HTMLElement).style.opacity)).toBe(
      "",
    );
  });
});
