/**
 * WCAG 2.1 contrast maths, for checking text over translucent layers (the
 * hero overlay) in unit tests. Colours are "#RRGGBB" or [r, g, b] in 0–255.
 */

export type Rgb = readonly [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`${hex} is not a #RRGGBB colour`);
  const n = Number.parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toRgb = (colour: string | Rgb): Rgb =>
  typeof colour === "string" ? hexToRgb(colour) : colour;

/** `fg` at `alpha` (0–1) laid over an opaque `bg`. */
export function composite(
  fg: string | Rgb,
  alpha: number,
  bg: string | Rgb,
): Rgb {
  const f = toRgb(fg);
  const b = toRgb(bg);
  return [0, 1, 2].map(
    (i) => f[i] * alpha + b[i] * (1 - alpha),
  ) as unknown as Rgb;
}

export function relativeLuminance(colour: string | Rgb): number {
  const [r, g, b] = toRgb(colour).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string | Rgb, b: string | Rgb): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}
