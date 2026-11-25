import { expect, test, type Page } from "@playwright/test";

// Runs against the production build (see playwright.config.ts).

/** Counts page-transition animations, and the opacity each one started from. */
async function recordTransitions(page: Page) {
  await page.addInitScript(() => {
    const log: unknown[] = [];
    Object.assign(window, { transitions: log });
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      if (this instanceof HTMLElement && "pageTransition" in this.dataset) {
        log.push({ keyframes, options });
      }
      return animate.call(this, keyframes, options);
    };
  });
}

type Transition = {
  keyframes: Record<string, unknown>;
  options: { duration: number };
};

const transitions = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { transitions: Transition[] }).transitions,
  );

/** How many navigations have animated (each animates opacity once). */
const count = async (page: Page) =>
  (await transitions(page)).filter(({ keyframes }) => "opacity" in keyframes)
    .length;

const follow = async (page: Page, href: string) => {
  await page.locator(`footer a[href="${href}"]`).first().click();
  await expect(page).toHaveURL(href);
};

/** Wrappers of the page on screen (Next keeps recent pages, hidden). */
const wrappers = (page: Page) =>
  page.locator("main [data-page-transition]:visible");

async function expectSettled(page: Page) {
  await expect(page.locator('[data-page-transition="running"]')).toHaveCount(0);
  for (const wrapper of await wrappers(page).all()) {
    expect(await wrapper.getAttribute("style")).toBeFalsy();
  }
}

async function load(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator(".splash")).toHaveCount(0);
  await page.locator("[data-hydrated]").first().waitFor({ state: "attached" });
}

test.describe("page transitions", () => {
  test.beforeEach(({ page }) => recordTransitions(page));

  test("the page that was loaded does not animate", async ({ page }) => {
    await load(page, "/services/ecg");
    expect(await count(page)).toBe(0);
    await expectSettled(page);
  });

  test("navigating animates once, between and within sections", async ({
    page,
  }) => {
    await load(page, "/");

    // Into a section: its template enters together with the root one.
    await follow(page, "/services");
    await expect.poll(() => count(page)).toBe(1);
    await expectSettled(page);

    // Within the section: only the section's template enters.
    await follow(page, "/services/ecg");
    await expect.poll(() => count(page)).toBe(2);
    await expectSettled(page);

    await follow(page, "/about");
    await expect.poll(() => count(page)).toBe(3);
    await expectSettled(page);
  });

  test("going back animates too", async ({ page }) => {
    await load(page, "/");
    await follow(page, "/about");
    await expect.poll(() => count(page)).toBe(1);
    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect.poll(() => count(page)).toBe(2);
    await expectSettled(page);
  });

  test("is a 250ms fade with an 8px rise", async ({ page }) => {
    await load(page, "/");
    await follow(page, "/about");
    await expect.poll(() => count(page)).toBe(1);
    const recorded = await transitions(page);
    const values = JSON.stringify(recorded.map((t) => t.keyframes));
    expect(values).toContain('"opacity":[0,1]');
    expect(values).toContain("translateY(8px)");
    for (const { options } of recorded) expect(options.duration).toBe(250);
  });
});

test.describe("page transitions, reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("are switched off", async ({ page }) => {
    await recordTransitions(page);
    await load(page, "/");
    await follow(page, "/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await count(page)).toBe(0);
    await expectSettled(page);
  });
});

test.describe("page transitions, no JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the page is fully visible", async ({ page }) => {
    await page.goto("/services/ecg");
    for (const wrapper of await page.locator("[data-page-transition]").all()) {
      await expect(wrapper).toHaveCSS("opacity", "1");
    }
  });
});
