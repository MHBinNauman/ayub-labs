import { expect, test } from "@playwright/test";
import { media } from "../src/data/site-data";

// Runs against the production build (see playwright.config.ts).

const photos = [
  ...media.hero,
  ...Object.values(media.services).filter((item) => item !== undefined),
  ...Object.values(media.banners),
  ...Object.values(media.about),
];

/** The optimiser URL next/image would use for a photo. */
const optimised = (src: string, width: number) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;

test.describe("image optimiser", () => {
  const src = media.hero[0].src;

  for (const { accept, type } of [
    { accept: "image/avif,image/webp,*/*", type: "image/avif" },
    { accept: "image/webp,*/*", type: "image/webp" },
  ]) {
    test(`serves ${type} when accepted`, async ({ request }) => {
      const response = await request.get(optimised(src, 480), {
        headers: { accept },
      });
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe(type);
    });
  }

  test("refuses remote images and widths that are not configured", async ({
    request,
  }) => {
    const remote = await request.get(
      optimised("https://example.com/photo.jpg", 480),
    );
    expect(remote.status()).toBe(400);
    const width = await request.get(optimised(src, 3840));
    expect(width.status()).toBe(400);
  });
});

test("every photo in media is served", async ({ request }) => {
  for (const { src } of photos) {
    const response = await request.head(src);
    expect(response.status(), src).toBe(200);
  }
});
