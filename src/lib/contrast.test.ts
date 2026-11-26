import { describe, expect, it } from "vitest";
import { brandTokens } from "@/data/site-data";
import { composite, contrastRatio, hexToRgb } from "./contrast";

const { colors, contrast } = brandTokens;

describe("contrastRatio", () => {
  it("matches the ratios recorded in brandTokens", () => {
    expect(contrastRatio(colors.navy, "#FFFFFF")).toBeCloseTo(
      contrast["navy/white"],
      1,
    );
    expect(contrastRatio(colors.logoBlue, "#FFFFFF")).toBeCloseTo(
      contrast["logoBlue/white"],
      1,
    );
    expect(contrastRatio(colors.redText, "#FFFFFF")).toBeCloseTo(
      contrast["redText/white"],
      1,
    );
  });

  it("is 21 for black on white and symmetric", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
  });
});

describe("composite", () => {
  it("returns the colours themselves at alpha 1 and 0", () => {
    expect(composite(colors.navy, 1, "#FFFFFF")).toEqual(hexToRgb(colors.navy));
    expect(composite(colors.navy, 0, "#FFFFFF")).toEqual([255, 255, 255]);
  });
});

describe("paleBlue CTA band", () => {
  it("keeps heading, body and muted text at AA on both gradient ends", () => {
    // colors.tint is rgba(105,143,208,0.11), laid over the white page.
    const tintOnWhite = composite([105, 143, 208], 0.11, "#FFFFFF");
    for (const background of [colors.paleBlue, tintOnWhite]) {
      for (const text of [colors.navy, colors.ink, colors.muted]) {
        expect(contrastRatio(text, background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
