import { expect, test, type Page } from "@playwright/test";

// Runs against the production build (see playwright.config.ts).

type Log = {
  /** Per view transition: "pseudo-element animation duration" of each animation. */
  views: string[][];
  /** Keyframes of each fallback fade. */
  fades: { opacity?: unknown }[];
};

/** Records every view transition, and every fallback fade of a page. */
async function record(page: Page) {
  await page.addInitScript(() => {
    const log: { views: string[][]; fades: unknown[] } = {
      views: [],
      fades: [],
    };
    Object.assign(window, { transitionLog: log });

    const start = document.startViewTransition;
    if (start) {
      document.startViewTransition = function (...args) {
        const transition = start.apply(this, args);
        const animations: string[] = [];
        log.views.push(animations);
        transition.ready.then(
          () => {
            for (const animation of document.getAnimations()) {
              const effect = animation.effect as KeyframeEffect;
              if (!effect.pseudoElement?.startsWith("::view-transition")) {
                continue;
              }
              const name = (animation as CSSAnimation).animationName ?? "-";
              animations.push(
                `${effect.pseudoElement} ${name} ${effect.getTiming().duration}`,
              );
            }
          },
          () => animations.push("failed"),
        );
        return transition;
      };
    }

    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      if (this instanceof HTMLElement && "pageTransition" in this.dataset) {
        log.fades.push(keyframes);
      }
      return animate.call(this, keyframes, options);
    };
  });
}

const log = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { transitionLog: Log }).transitionLog,
  );

const views = async (page: Page) => (await log(page)).views.length;

/** How many navigations used the fallback (each animates opacity once). */
const fades = async (page: Page) =>
  (await log(page)).fades.filter((keyframes) => "opacity" in keyframes).length;

const follow = async (page: Page, href: string) => {
  await page.locator(`footer a[href="${href}"]`).first().click();
  await expect(page).toHaveURL(href);
};

/** Nothing is left running, and no inline style is left on a page wrapper. */
async function expectSettled(page: Page) {
  await expect(page.locator('[data-page-transition="running"]')).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) =>
              (animation.effect as KeyframeEffect).pseudoElement?.startsWith(
                "::view-transition-new",
              ),
            ).length,
      ),
    )
    .toBe(0);
  for (const wrapper of await page
    .locator("main [data-page-transition]:visible")
    .all()) {
    expect(await wrapper.evaluate((el) => el.style.opacity)).toBe("");
    expect(await wrapper.evaluate((el) => el.style.transform)).toBe("");
  }
}

async function load(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator(".splash")).toHaveCount(0);
  await page.locator("[data-hydrated]").first().waitFor({ state: "attached" });
}

/** A browser whose view transitions React cannot use. */
async function withoutViewTransitions(page: Page) {
  await page.addInitScript(() => {
    Reflect.deleteProperty(Document.prototype, "startViewTransition");
  });
}

test.describe("page transitions", () => {
  // About the animation itself; reduced motion has its own block. Pinned so
  // the reduced-motion run (pnpm test:e2e:reduced) checks the same thing.
  test.use({ reducedMotion: "no-preference" });
  test.beforeEach(({ page }) => record(page));

  test("the page that was loaded does not animate", async ({ page }) => {
    await load(page, "/services/ecg");
    expect(await log(page)).toEqual({ views: [], fades: [] });
  });

  test("navigating crossfades once, between and within sections", async ({
    page,
  }) => {
    await load(page, "/");

    for (const [index, href] of [
      "/services",
      "/services/ecg",
      "/services/haematology",
      "/about",
    ].entries()) {
      await follow(page, href);
      await expect.poll(() => views(page)).toBe(index + 1);
      await expectSettled(page);
    }

    const { views: recorded, fades: fallback } = await log(page);
    expect(fallback).toEqual([]);
    for (const animations of recorded) {
      // One page leaves and one enters, even where templates are nested.
      const leaving = animations.filter((name) =>
        /old\((?!root)[^)]*\) page-fade 260$/.test(name),
      );
      const entering = animations.filter((name) =>
        /new\([^)]*\) page-(fade 380|rise 500)$/.test(name),
      );
      // (None leaves on a phone: at the footer the old page is off-screen.)
      expect(leaving.length).toBeLessThanOrEqual(1);
      expect(entering).toHaveLength(2);
      // The footer fades with the old page, so no frame is blank.
      expect(animations).toContain("::view-transition-old(root) page-fade 260");
      // The header and WhatsApp button never fade; cards do not fly out.
      expect(animations.join()).not.toMatch(
        /(old|new)\((site-header|floating-whatsapp)\)|svc-/,
      );
    }
  });

  test("the page on screen fades out as the next one fades in", async ({
    page,
  }) => {
    await load(page, "/services");
    await page.locator('main a[href="/services/ecg"]').first().click();
    await expect(page).toHaveURL("/services/ecg");
    await expect
      .poll(async () => (await log(page)).views[0]?.join("; "))
      .toMatch(/old\((?!root)[^)]*\) page-fade 260/);
    expect((await log(page)).views[0].join("; ")).toMatch(
      /new\([^)]*\) page-rise 500/,
    );
  });

  test("the next page can be used while it is still fading in", async ({
    page,
  }) => {
    await load(page, "/");
    await follow(page, "/about");
    // No waiting: straight on to the next link.
    await follow(page, "/contact");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Contact",
    );
    await expectSettled(page);
  });

  test("switching service tabs still only moves the cards", async ({
    page,
  }) => {
    await load(page, "/");
    await page.getByRole("tab", { name: /Diagnostics/ }).click();
    await expect.poll(() => views(page)).toBe(1);
    await expect
      .poll(async () => (await log(page)).views[0].join())
      .toContain("svc-ecg");
    expect((await log(page)).views[0].join()).not.toMatch(
      /page-rise|page-fade 380/,
    );
  });

  test("Back fades the page in", async ({ page }) => {
    await load(page, "/");
    await follow(page, "/about");
    await expect.poll(() => views(page)).toBe(1);

    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect.poll(() => fades(page)).toBe(1);
    await expectSettled(page);

    // And a link after it crossfades again.
    await follow(page, "/contact");
    await expect.poll(() => views(page)).toBe(2);
    expect(await fades(page)).toBe(1);
  });

  test("Back adds nothing when the browser animated it (swipe)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const event = (window as unknown as Record<string, typeof Event>)
        .NavigateEvent;
      Object.defineProperty(event.prototype, "hasUAVisualTransition", {
        get: () => true,
      });
    });
    await load(page, "/");
    await follow(page, "/about");
    await expect.poll(() => views(page)).toBe(1);
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Reliable diagnostics",
    );
    expect(await fades(page)).toBe(0);
  });
});

test.describe("page transitions without browser support", () => {
  // About the animation itself; reduced motion has its own block. Pinned so
  // the reduced-motion run (pnpm test:e2e:reduced) checks the same thing.
  test.use({ reducedMotion: "no-preference" });
  test("fall back to a fade with a 16px rise", async ({ page }) => {
    await withoutViewTransitions(page);
    await record(page);
    await load(page, "/");
    expect(await fades(page)).toBe(0);

    await follow(page, "/services");
    await expect.poll(() => fades(page)).toBe(1);
    await expectSettled(page);
    await follow(page, "/services/ecg");
    await expect.poll(() => fades(page)).toBe(2);
    await expectSettled(page);

    const recorded = JSON.stringify((await log(page)).fades);
    expect(recorded).toContain('"opacity":[0,1]');
    expect(recorded).toContain("translateY(16px)");
  });
});

test.describe("page transitions, reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("swap instantly", async ({ page }) => {
    await record(page);
    await load(page, "/");
    await follow(page, "/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "About",
    );
    await page.goBack();
    await expect(page).toHaveURL("/");

    const { views: recorded, fades: fallback } = await log(page);
    expect(fallback).toEqual([]);
    for (const animation of recorded.flat()) {
      expect(animation).toMatch(/ 0$/);
    }
  });

  test("swap instantly without browser support", async ({ page }) => {
    await withoutViewTransitions(page);
    await record(page);
    await load(page, "/");
    await follow(page, "/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "About",
    );
    expect(await fades(page)).toBe(0);
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
