import { expect, test, type Page } from "@playwright/test";
import { brand } from "../src/data/site-data";
import { SPLASH_FADE_MS, SPLASH_HOLD_MS, SPLASH_KEY } from "../src/lib/splash";

// Runs against the production build (see playwright.config.ts).

const splash = (page: Page) => page.locator(".splash");

type Frame = { time: number; visible: boolean; state: string | null };

/** Records, on every frame from before first paint, whether the splash shows. */
async function recordFrames(page: Page) {
  await page.addInitScript(() => {
    const frames: unknown[] = [];
    Object.assign(window, { splashFrames: frames });
    const sample = () => {
      const element = document.querySelector(".splash");
      const style = element && getComputedStyle(element);
      frames.push({
        time: performance.now(),
        visible:
          !!style &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0",
        state: document.documentElement?.dataset.splash ?? null,
      });
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

const frames = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { splashFrames: Frame[] }).splashFrames,
  );

/** The frames, once one in this state is in: it may be recorded just after. */
async function framesUntil(page: Page, state: string) {
  await expect
    .poll(async () => (await frames(page)).some((f) => f.state === state))
    .toBe(true);
  return frames(page);
}

const seen = (page: Page) =>
  page.evaluate((key) => sessionStorage.getItem(key), SPLASH_KEY);

/** Holds back one image, so window "load" does not fire for a while. */
async function stallLoad(page: Page, ms: number) {
  await page.route("**/_next/image*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    await route.continue().catch(() => {});
  });
}

/**
 * Makes the splash's own script throw before it schedules anything: it is the
 * first caller of matchMedia. Everything after it works normally.
 */
async function breakSplashScript(page: Page) {
  await page.addInitScript(() => {
    const matchMedia = window.matchMedia;
    window.matchMedia = () => {
      window.matchMedia = matchMedia;
      throw new Error("blocked");
    };
  });
}

test.describe("splash screen", () => {
  test("first load: shown, announced, then removed", async ({ page }) => {
    await recordFrames(page);
    await stallLoad(page, 900);
    await page.goto("/", { waitUntil: "commit" });

    const status = page.getByRole("status", {
      name: `Loading ${brand.displayName}`,
    });
    await expect(status).toBeVisible();
    await expect(splash(page).locator("a, button, [tabindex]")).toHaveCount(0);
    // The page underneath is rendered normally, not hidden.
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
      "opacity",
      "1",
    );

    await expect(splash(page)).toHaveCount(0);
    expect(await seen(page)).toBe("1");
    expect((await frames(page)).some((frame) => frame.visible)).toBe(true);
  });

  test("reload in the same tab: never painted", async ({ page }) => {
    await page.goto("/");
    await expect(splash(page)).toHaveCount(0);

    await recordFrames(page);
    await page.reload();
    await expect(splash(page)).toHaveCount(0);
    const recorded = await frames(page);
    expect(recorded.length).toBeGreaterThan(0);
    expect(recorded.filter((frame) => frame.visible)).toEqual([]);
  });

  test("another page in the same tab: never painted", async ({ page }) => {
    await page.goto("/");
    await expect(splash(page)).toHaveCount(0);

    await recordFrames(page);
    await page.goto("/about");
    await expect(splash(page)).toHaveCount(0);
    expect((await frames(page)).filter((frame) => frame.visible)).toEqual([]);
  });

  test("new tab: shown again", async ({ page, context }) => {
    await page.goto("/");
    await expect(splash(page)).toHaveCount(0);

    const tab = await context.newPage();
    await recordFrames(tab);
    await tab.goto("/");
    await expect(splash(tab)).toHaveCount(0);
    expect((await frames(tab)).some((frame) => frame.visible)).toBe(true);
  });

  for (const { name, stall } of [
    { name: "fast", stall: 0 },
    { name: "slow", stall: 6000 },
  ]) {
    test(`two seconds on screen on a ${name} load`, async ({ page }) => {
      await recordFrames(page);
      if (stall) await stallLoad(page, stall);
      await page.goto("/", { waitUntil: "commit" });
      await expect(splash(page)).toBeVisible();
      await expect(splash(page)).toHaveCount(0);

      const recorded = await framesUntil(page, "done");
      const time = (found: Frame | undefined) => found!.time;
      const first = time(recorded.find((frame) => frame.visible));
      const fading = time(recorded.find((frame) => frame.state === "out"));
      const done = time(recorded.find((frame) => frame.state === "done"));
      // Solid long enough to read, however fast the page is…
      expect(fading - first).toBeGreaterThan(SPLASH_HOLD_MS - 50);
      // …and never longer, however slow it is.
      expect(done - first).toBeLessThan(SPLASH_HOLD_MS + SPLASH_FADE_MS + 400);
      if (stall) {
        expect(await page.evaluate(() => document.readyState)).not.toBe(
          "complete",
        );
      }
    });
  }

  test("does not block the page while it fades", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.dataset.splash = "out";
    });
    if ((await splash(page).count()) > 0) {
      await expect(splash(page)).toHaveCSS("pointer-events", "none");
    }
  });

  test("causes no console or hydration errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(splash(page)).toHaveCount(0);
    // Not networkidle: after a reload Playwright keeps counting the prefetches
    // the first load started.
    await page.reload();
    await page
      .locator("[data-hydrated]")
      .first()
      .waitFor({ state: "attached" });
    expect(errors).toEqual([]);
  });

  test("hides itself even if its script fails", async ({ page }) => {
    await breakSplashScript(page);
    await recordFrames(page);
    await page.goto("/");
    await expect(splash(page)).toBeVisible();
    await expect(splash(page)).toBeHidden({ timeout: 6000 });

    // Hidden by the CSS safety net, not by the script or by a crash.
    await expect(splash(page)).toHaveCount(1);
    const visible = (await frames(page)).filter((frame) => frame.visible);
    expect(visible.at(-1)!.time - visible[0].time).toBeGreaterThan(3500);
    expect(visible.every((frame) => frame.state === null)).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("blocked sessionStorage: skipped, not shown on every load", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "sessionStorage", {
        get() {
          throw new DOMException("denied", "SecurityError");
        },
      });
    });
    await recordFrames(page);
    await page.goto("/");
    await expect(splash(page)).toHaveCount(0);
    expect((await frames(page)).filter((frame) => frame.visible)).toEqual([]);
  });
});

test.describe("splash screen, reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("no animation, gone as soon as the page loads", async ({ page }) => {
    await stallLoad(page, 900);
    await page.goto("/", { waitUntil: "commit" });
    await expect(splash(page)).toBeVisible();
    const animations = await page.evaluate(() =>
      document
        .getAnimations()
        .map((animation) => (animation as CSSAnimation).animationName)
        .filter((name) => name?.startsWith("splash")),
    );
    // Only the safety net, which moves nothing.
    expect(animations.filter((name) => name !== "splash-failsafe")).toEqual([]);

    await page.waitForLoadState("load");
    await expect(splash(page)).toHaveCount(0, { timeout: 250 });
  });
});

test.describe("splash screen, no JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("is hidden", async ({ page }) => {
    await page.goto("/");
    await expect(splash(page)).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
