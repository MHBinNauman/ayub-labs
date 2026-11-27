import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import sitemap from "../src/app/sitemap";
import { media } from "../src/data/site-data";
import { composite, contrastRatio, type Rgb } from "../src/lib/contrast";
import { SPLASH_KEY } from "../src/lib/splash";

// Runs against the production build (see playwright.config.ts).

/** Every public page (from the sitemap, so new pages are covered) plus the 404. */
const paths = [
  ...sitemap().map((entry) => new URL(entry.url).pathname),
  "/this-page-does-not-exist",
];

/** Serious and critical WCAG 2.1 A/AA violations, formatted for the report. */
async function seriousViolations(page: Page): Promise<string[]> {
  // Scan the page itself, not the splash laid over it. It leaves after
  // hydration plus its 2s show (SPLASH_HOLD_MS + SPLASH_FADE_MS); with every
  // worker busy that passed the default 5s assertion timeout.
  await expect(page.locator(".splash")).toHaveCount(0, { timeout: 15_000 });
  // Contrast is measured on finished frames: a UI fade caught mid-way (the
  // mobile drawer's items, a crossfade) would read as low contrast. Only
  // short animations are waited for; the hero's slow zoom and the
  // scroll-driven banner parallax never settle and don't change colours.
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      if (animation.playState !== "running") return true;
      if (animation.timeline !== document.timeline) return true;
      const duration = Number(animation.effect?.getTiming().duration);
      return !(duration <= 1000);
    }),
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // Google's map iframe is third-party content we cannot change.
    .exclude("iframe[src*='google.com/maps']")
    .analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map(
      (v) =>
        `${v.impact} ${v.id}: ${v.help} (${v.helpUrl})\n    ${v.nodes
          .slice(0, 5)
          .map((node) => node.target.join(" "))
          .join("\n    ")}`,
    );
}

test.describe("axe: no serious or critical violations", () => {
  for (const path of paths) {
    test(path, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await seriousViolations(page)).toEqual([]);
    });
  }

  test("the splash screen", async ({ page }) => {
    // Its script (the first caller of matchMedia) fails, so it stays up.
    await page.addInitScript(() => {
      const matchMedia = window.matchMedia;
      window.matchMedia = () => {
        window.matchMedia = matchMedia;
        throw new Error("blocked");
      };
    });
    await page.goto("/");
    const splash = page.locator(".splash");
    await expect(splash).toBeVisible();
    const results = await new AxeBuilder({ page }).include(".splash").analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test("with the mobile menu open", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the drawer is the phone navigation");
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });

  test("with the services mega menu open", async ({ page, isMobile }) => {
    test.skip(isMobile, "the mega menu is desktop navigation");
    await page.goto("/", { waitUntil: "networkidle" });
    const trigger = page.getByRole("button", { name: "Services" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await seriousViolations(page)).toEqual([]);
  });
});

/*
 * Hero copy over each slide. axe cannot judge text on a photo (it reports
 * such contrast as "needs review", not a pass), so this measures it: hide
 * the text, photograph what is behind each line, and test the text colour
 * against the lightest pixel there, which is the worst case for white
 * text. hero.test.ts proves the same for a pure white photo pixel; this
 * checks the real photos, through the real overlay, at both layouts.
 */
test.describe("hero copy contrast on every slide", () => {
  // The slide controls are hidden under reduced motion.
  test.use({ reducedMotion: "no-preference" });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      sessionStorage.setItem(key, "1");
    }, SPLASH_KEY);
  });

  type TextBox = {
    label: string;
    rect: { x: number; y: number; width: number; height: number };
    rgb: Rgb;
    alpha: number;
    large: boolean;
  };

  /** Text in the hero that sits straight on the photo (no box of its own). */
  const textOnPhoto = (page: Page) =>
    page.evaluate((): TextBox[] => {
      const hero = document.querySelector<HTMLElement>("[data-hero]")!;
      const boxes: TextBox[] = [];
      const paint = document
        .createElement("canvas")
        .getContext("2d", { willReadFrequently: true })!;
      const walker = document.createTreeWalker(hero, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const el = node.parentElement;
        if (!node.textContent?.trim() || !el) continue;
        if (!el.checkVisibility({ checkOpacity: true })) continue;
        // The nearest painted background must be the hero itself.
        let painted: HTMLElement | null = el;
        while (painted && painted !== hero) {
          const style = getComputedStyle(painted);
          const bg = style.backgroundColor;
          const transparent =
            bg === "transparent" || /rgba\(.*,\s*0\)$/.test(bg);
          if (!transparent || style.backgroundImage !== "none") break;
          painted = painted.parentElement;
        }
        if (painted !== hero) continue;

        const style = getComputedStyle(el);
        // Computed colours can be oklab()/color-mix() (Tailwind v4 opacity
        // modifiers); a canvas converts any of them to sRGB.
        paint.clearRect(0, 0, 1, 1);
        paint.fillStyle = style.color;
        paint.fillRect(0, 0, 1, 1);
        const [r, g, b, a255] = paint.getImageData(0, 0, 1, 1).data;
        const a = a255 / 255;
        const size = parseFloat(style.fontSize);
        const bold = Number(style.fontWeight) >= 700;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (rect.width < 2 || rect.height < 2) continue;
          boxes.push({
            label: node.textContent.trim().slice(0, 30),
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            },
            rgb: [r, g, b],
            alpha: a,
            large: size >= 24 || (bold && size >= 18.66),
          });
        }
      }
      return boxes;
    });

  /** The lightest pixel in a PNG, as [r, g, b]. */
  async function lightestPixel(png: Buffer): Promise<Rgb> {
    const { data, info } = await sharp(png)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let best: Rgb = [0, 0, 0];
    let bestSum = -1;
    for (let i = 0; i < info.width * info.height * 3; i += 3) {
      // Luminance order: green weighs most, then red, then blue.
      const sum =
        0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (sum > bestSum) {
        bestSum = sum;
        best = [data[i], data[i + 1], data[i + 2]];
      }
    }
    return best;
  }

  for (const [index] of media.hero.entries()) {
    test(`slide ${index + 1}`, async ({ page }, testInfo) => {
      await page.goto("/", { waitUntil: "networkidle" });
      const group = page.getByRole("group", { name: "Photos of our lab" });
      await expect(group).toHaveAttribute("data-hydrated", "true");
      await group.getByRole("button", { name: "Pause slideshow" }).click();
      await group
        .getByRole("button", { name: `Show slide ${index + 1}` })
        .click();
      const slide = group.locator(`[data-slide="${index}"]`);
      await expect(slide).toHaveAttribute("data-state", "active");
      await expect(slide.locator("img")).toHaveJSProperty("complete", true);

      // The controls sit low in the hero, so clicking them scrolled the
      // page. Back to the top, tall enough to show the whole hero, then let
      // the crossfade finish (HERO_FADE_MS, 1.2s).
      await page.evaluate(() => window.scrollTo(0, 0));
      const heroBottom = await page
        .locator("[data-hero]")
        .evaluate((hero) => hero.getBoundingClientRect().bottom);
      const size = page.viewportSize()!;
      if (heroBottom > size.height) {
        await page.setViewportSize({
          width: size.width,
          height: Math.ceil(heroBottom),
        });
      }
      await page.waitForTimeout(1400);

      const axe = await new AxeBuilder({ page })
        .include("[data-hero]")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        axe.violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => v.id),
      ).toEqual([]);

      const boxes = await textOnPhoto(page);
      expect(boxes.length).toBeGreaterThan(0);
      await page.addStyleTag({
        content:
          "[data-hero] * { color: transparent !important; text-decoration-color: transparent !important; caret-color: transparent !important; }",
      });

      const results: string[] = [];
      let lowest = Infinity;
      for (const box of boxes) {
        const png = await page.screenshot({ clip: box.rect });
        const bg = await lightestPixel(png);
        const ratio = contrastRatio(composite(box.rgb, box.alpha, bg), bg);
        lowest = Math.min(lowest, ratio);
        const needed = box.large ? 3 : 4.5;
        if (ratio < needed) {
          results.push(`"${box.label}" ${ratio.toFixed(2)}:1 < ${needed}:1`);
        }
      }
      testInfo.annotations.push({
        type: "lowest contrast",
        description: `${lowest.toFixed(2)}:1 over ${boxes.length} text boxes`,
      });
      console.log(
        `[${testInfo.project.name}] slide ${index + 1}: lowest ${lowest.toFixed(2)}:1 over ${boxes.length} text boxes`,
      );
      expect(results).toEqual([]);
    });
  }
});
