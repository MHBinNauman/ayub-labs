import { describe, expect, it } from "vitest";
import { brandTokens } from "@/data/site-data";
import { composite, contrastRatio } from "./contrast";
import { HERO_OVERLAY, nextSlide } from "./hero";

const WHITE = "#FFFFFF";
const AA = 4.5;

/** Navy at `alpha` over the worst possible photo pixel: pure white. */
const worstBackground = (alpha: number) =>
  composite(brandTokens.colors.navy, alpha, WHITE);

describe("hero overlay contrast (worst case: a white photo pixel)", () => {
  it.each([
    ["mobile top", HERO_OVERLAY.mobileTop],
    ["mobile bottom", HERO_OVERLAY.mobileBottom],
  ])("white text passes AA at the %s stop", (_, alpha) => {
    expect(contrastRatio(WHITE, worstBackground(alpha))).toBeGreaterThanOrEqual(
      AA,
    );
  });

  it("white/85 text passes AA where desktop copy meets the photo", () => {
    const bg = worstBackground(HERO_OVERLAY.desktopSeam);
    const text = composite(WHITE, 0.85, bg);
    expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(AA);
  });

  it("the overlay only gets darker towards the bottom", () => {
    expect(HERO_OVERLAY.mobileBottom).toBeGreaterThanOrEqual(
      HERO_OVERLAY.mobileTop,
    );
  });
});

describe("nextSlide", () => {
  it("moves to the next slide and wraps round", () => {
    expect(nextSlide(0, [true, true, true])).toBe(1);
    expect(nextSlide(2, [true, true, true])).toBe(0);
  });

  it("skips slides that have not loaded", () => {
    expect(nextSlide(0, [true, false, true])).toBe(2);
    expect(nextSlide(2, [false, true, true])).toBe(1);
  });

  it("stays put while no other slide is ready", () => {
    expect(nextSlide(0, [true, false, false])).toBe(0);
  });
});
