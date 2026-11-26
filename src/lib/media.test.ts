import { describe, expect, it } from "vitest";
import { media, type MediaItem } from "@/data/site-data";
import { mediaProps } from "./media";

const items: MediaItem[] = [
  ...media.hero,
  ...Object.values(media.services).filter((item) => item !== undefined),
  ...Object.values(media.banners),
  ...Object.values(media.about),
];

describe("mediaProps", () => {
  it.each(items)("has a size and a small blur for $src", (item) => {
    const props = mediaProps(item);
    expect(props).toMatchObject({ src: item.src, alt: item.alt });
    expect(props.width).toBeGreaterThan(0);
    expect(props.height).toBeGreaterThan(0);
    expect(props.width).toBeLessThanOrEqual(2400);
    expect(props.blurDataURL).toMatch(/^data:image\/webp;base64,/);
    expect(props.blurDataURL.length).toBeLessThan(1024);
  });

  it("throws for a photo that was never processed", () => {
    expect(() => mediaProps({ src: "/nope.jpg", alt: "x" })).toThrowError(
      /pnpm images/,
    );
  });
});
