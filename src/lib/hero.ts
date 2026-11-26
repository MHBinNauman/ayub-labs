/**
 * Homepage hero: slider timings and the navy overlay that keeps white text
 * readable over the photos. HeroSlider uses the timings inline and Hero sets
 * the overlay as CSS variables, so globals.css never repeats these numbers.
 */

/** How long each slide is shown before the next one fades in. */
export const HERO_SLIDE_MS = 6000;
/** Crossfade between slides. */
export const HERO_FADE_MS = 1200;
/** Ken Burns zoom: runs through the slide's time on screen and its fade out. */
export const HERO_ZOOM_MS = HERO_SLIDE_MS + HERO_FADE_MS;

/**
 * Navy opacity of the overlay, 0–1. Below lg the photo fills the hero and
 * the copy sits on it, top to bottom. From lg the copy only overlaps the
 * photo's left edge, where the mask is at least `desktopSeam`.
 * hero.test.ts checks white text against a pure white photo pixel under each
 * stop, so a photo swap can never break contrast.
 */
export const HERO_OVERLAY = {
  mobileTop: 0.8,
  mobileBottom: 0.9,
  desktopSeam: 0.88,
} as const;

/** As CSS custom properties, for the hero <section>'s style. */
export const heroOverlayVars = {
  "--hero-top": `${HERO_OVERLAY.mobileTop * 100}%`,
  "--hero-bottom": `${HERO_OVERLAY.mobileBottom * 100}%`,
  "--hero-seam": `${HERO_OVERLAY.desktopSeam * 100}%`,
} as const;

/**
 * The slide after `active` that has finished loading, wrapping round, or
 * `active` itself when no other slide is ready yet.
 */
export function nextSlide(active: number, loaded: readonly boolean[]): number {
  const count = loaded.length;
  for (let step = 1; step < count; step++) {
    const index = (active + step) % count;
    if (loaded[index]) return index;
  }
  return active;
}
