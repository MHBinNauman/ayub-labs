/**
 * Inner-page banner (PageBanner.tsx): the overlay that keeps it on brand and
 * keeps white text readable over any photo. PageBanner sets these as CSS
 * variables, so globals.css (.banner-overlay) never repeats the numbers.
 *
 * From lg the overlay is navy at `navy` from the left edge to `hold` of the
 * width, where the copy sits (PageBanner caps it at half the container),
 * then eases to logo blue at `blue` on the right. Below lg the copy spans the
 * full width, so the overlay is navy at `navy` all the way across.
 * banner.test.ts checks the copy against a pure white photo pixel.
 */
export const BANNER_OVERLAY = {
  navy: 0.85,
  hold: 0.55,
  blue: 0.7,
} as const;

/** Opacity of the intro line under the white H1. */
export const BANNER_INTRO_ALPHA = 0.8;

/** As CSS custom properties, for the banner <section>'s style. */
export const bannerOverlayVars = {
  "--banner-navy": `${BANNER_OVERLAY.navy * 100}%`,
  "--banner-hold": `${BANNER_OVERLAY.hold * 100}%`,
  "--banner-blue": `${BANNER_OVERLAY.blue * 100}%`,
} as const;
