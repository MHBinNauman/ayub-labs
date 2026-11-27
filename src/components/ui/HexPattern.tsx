/**
 * One hexagon plus the stem that joins it to the row below tiles a
 * honeycomb. Drawn at 56×96 and shown at 1.25× (a 70×120 tile).
 */
const TILE = [
  `<svg xmlns='http://www.w3.org/2000/svg' width='70' height='120' viewBox='0 0 56 96' fill='white'>`,
  `<path d='M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L28 96' fill='none' stroke='white' stroke-width='1'/>`,
  `<circle cx='28' cy='0' r='2.5'/><circle cx='56' cy='48' r='2.5'/><circle cx='0' cy='48' r='2.5'/>`,
  `</svg>`,
].join("");

const backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(TILE)}")`;

/**
 * Thin hexagon / molecule line pattern, ~6% white on the navy gradient
 * (hero and splash).
 *
 * A repeated CSS background tile, not an inline SVG <pattern>: the browser
 * rasterises one small tile and repeats it, where a full-screen SVG pattern
 * was redrawn at full size and cost ~300ms of main thread before first paint
 * on a throttled phone.
 */
export function HexPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{ backgroundImage, backgroundSize: "70px 120px" }}
    />
  );
}
