import { expect, test, type Page } from "@playwright/test";
import { contact, services } from "../src/data/site-data";

/** Accessible-ish description of the focused element, for readable failures. */
async function focused(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return "<body>";
    const label = el.getAttribute("aria-label") ?? el.innerText ?? "";
    return `${el.tagName.toLowerCase()}:${label.replace(/\s+/g, " ").trim()}`;
  });
}

/** Presses Tab until `predicate` matches the focused element, or gives up. */
async function tabUntil(
  page: Page,
  predicate: (description: string) => boolean,
  max = 40,
): Promise<string[]> {
  const seen: string[] = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const now = await focused(page);
    seen.push(now);
    if (predicate(now)) return seen;
  }
  throw new Error(`Never reached target. Focus went: ${seen.join(" → ")}`);
}

/** Desktop pages: wait until the mega menu has hydrated before using keys or hover. */
async function openDesktop(page: Page, path: string) {
  await page.goto(path);
  await page
    .getByRole("navigation", { name: "Main" })
    .locator("[data-hydrated]")
    .waitFor();
}

test.describe("layout landmarks", () => {
  test("has one header, one main, one footer and a skip link", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    // No duplicated mobile nav in the DOM while the drawer is closed.
    await expect(page.locator("dialog")).toHaveCount(0);

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("footer shows the current year and no social links while unset", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toContainText(
      `© ${new Date().getFullYear()} Ayyub Labs & Clinics`,
    );
    await expect(
      footer.getByRole("img", { name: /Punjab Healthcare/ }),
    ).toBeVisible();
    if (contact.social.facebook === null) {
      await expect(footer.getByRole("link", { name: "Facebook" })).toHaveCount(
        0,
      );
    }
  });

  test("WhatsApp button pre-fills a greeting", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("link", { name: "Chat on WhatsApp" });
    await expect(button).toBeVisible();
    const href = await button.getAttribute("href");
    expect(href).toContain(`wa.me/${contact.whatsapp.number}?text=`);
    expect(decodeURIComponent(href!.split("text=")[1])).toMatch(
      /^Hello Ayyub Labs, I'd like to ask about/,
    );
  });
});

test.describe("desktop header", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("keyboard reaches every header control in order", async ({ page }) => {
    await openDesktop(page, "/");
    const order = await tabUntil(page, (d) => d.startsWith("button:Services"));
    const joined = order.join(" → ");
    // Top bar, then band, then nav strip.
    const expected = [
      "Skip to content",
      contact.mobile.display,
      "WhatsApp",
      "Get your report",
      "Find a branch",
      "AYYUB LABS",
      "Call",
      "WhatsApp",
      "Home",
      "Services",
    ];
    let cursor = 0;
    for (const step of order) {
      if (cursor < expected.length && step.includes(expected[cursor])) cursor++;
    }
    expect(cursor, `focus order was: ${joined}`).toBe(expected.length);
  });

  test("mega menu: Enter opens, Tab is trapped, Esc closes", async ({
    page,
  }) => {
    await openDesktop(page, "/");
    const trigger = page.getByRole("button", { name: "Services" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger).toBeFocused();

    // Tab walks every service link, then "View all services", then wraps.
    const panelLinks = services.length + 1;
    for (let i = 0; i < panelLinks; i++) await page.keyboard.press("Tab");
    expect(await focused(page)).toContain("View all services");
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    expect(await focused(page)).toContain("View all services");

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await expect(
      page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "View all services" }),
    ).toBeHidden();

    // Once closed, Tab moves on to the next nav item.
    await page.keyboard.press("Tab");
    expect(await focused(page)).toContain("Reports");
  });

  test("mega menu: ArrowDown opens on the first service", async ({ page }) => {
    await openDesktop(page, "/");
    const trigger = page.getByRole("button", { name: "Services" });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("link", { name: services[0].name }).first(),
    ).toBeFocused();
    await page.keyboard.press("ArrowUp");
    expect(await focused(page)).toContain("View all services");
  });

  test("mega menu: hover opens after the intent delay and closes on leave", async ({
    page,
  }) => {
    await openDesktop(page, "/");
    const trigger = page.getByRole("button", { name: "Services" });
    await trigger.hover();
    // Not instantly: the 120ms intent delay.
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    // Top bar: outside both the trigger and the full-width panel.
    await page.mouse.move(5, 5);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("header band scrolls away and the nav strip sticks", async ({
    page,
  }) => {
    await openDesktop(page, "/styleguide");
    const header = page.locator("header");
    const nav = page.getByRole("navigation", { name: "Main" });
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect(header).toHaveAttribute("data-stuck", "");
    // Poll: layout can settle a frame after the attribute flips.
    await expect.poll(async () => (await nav.boundingBox())?.y).toBe(0);
  });
});

test.describe("mobile header", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("drawer opens as a modal, traps focus and returns it on Esc", async ({
    page,
  }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: "Menu", exact: true });
    await hamburger.focus();
    await page.keyboard.press("Enter");

    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();
    await expect(hamburger).toHaveAttribute("aria-expanded", "true");
    await expect(
      drawer.getByRole("button", { name: "Close menu" }),
    ).toBeFocused();

    // Action bar: Call | WhatsApp | Directions.
    await expect(drawer.getByRole("link", { name: "Call" })).toHaveAttribute(
      "href",
      `tel:${contact.mobile.e164}`,
    );
    await expect(drawer.getByRole("link", { name: "WhatsApp" })).toBeVisible();
    await expect(
      drawer.getByRole("link", { name: /^Directions/ }),
    ).toBeVisible();

    // The floating WhatsApp button steps aside while the drawer is open.
    await expect(page.locator(".vt-whatsapp")).toBeHidden();

    // Services expands inline.
    await drawer.getByText("Services", { exact: true }).click();
    await expect(
      drawer.getByRole("link", { name: services[0].name }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(hamburger).toBeFocused();
    await expect(page.locator("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Chat on WhatsApp" }),
    ).toBeVisible();
  });

  test("choosing a page closes the drawer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await drawer.getByRole("link", { name: "Home" }).click();
    await expect(page.locator("dialog")).toHaveCount(0);
  });

  test("call and WhatsApp stay one tap away after scrolling", async ({
    page,
  }) => {
    await page.goto("/styleguide");
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect(
      page.getByRole("link", { name: "Call", exact: true }),
    ).toBeInViewport();
    await expect(
      page.getByRole("link", { name: "Chat on WhatsApp" }),
    ).toBeInViewport();
    await expect(
      page.getByRole("button", { name: "Menu", exact: true }),
    ).toBeInViewport();
  });
});
