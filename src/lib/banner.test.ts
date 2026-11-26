import { describe, expect, it } from "vitest";
import { brandTokens } from "@/data/site-data";
import { BANNER_INTRO_ALPHA, BANNER_OVERLAY } from "./banner";
import { composite, contrastRatio } from "./contrast";

const WHITE = "#FFFFFF";
const AA = 4.5;

describe("page banner overlay contrast (worst case: a white photo pixel)", () => {
  // Wherever the copy sits (all of it below lg; the held left part from lg),
  // the overlay is navy at BANNER_OVERLAY.navy.
  const background = composite(
    brandTokens.colors.navy,
    BANNER_OVERLAY.navy,
    WHITE,
  );

  it("the white H1 passes AA", () => {
    expect(contrastRatio(WHITE, background)).toBeGreaterThanOrEqual(AA);
  });

  it("the white/80 intro passes AA", () => {
    const intro = composite(WHITE, BANNER_INTRO_ALPHA, background);
    expect(contrastRatio(intro, background)).toBeGreaterThanOrEqual(AA);
  });

  it("the navy hold covers the copy column (half the container) with room", () => {
    expect(BANNER_OVERLAY.hold).toBeGreaterThanOrEqual(0.55);
  });

  it("the overlay lightens towards logo blue on the right, never darkens", () => {
    expect(BANNER_OVERLAY.blue).toBeLessThanOrEqual(BANNER_OVERLAY.navy);
  });
});
