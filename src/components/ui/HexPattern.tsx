/**
 * Thin hexagon / molecule line pattern, drawn inline. ~6% white on the navy
 * gradient. `id` names the SVG pattern and must be unique on the page.
 */
export function HexPattern({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      className="pointer-events-none absolute inset-0 size-full text-white opacity-[0.06]"
    >
      <defs>
        <pattern
          id={id}
          width="56"
          height="96"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(1.25)"
        >
          {/* One hexagon plus the stem that joins it to the row below tiles a honeycomb. */}
          <path
            d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L28 96"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="28" cy="0" r="2.5" fill="currentColor" />
          <circle cx="56" cy="48" r="2.5" fill="currentColor" />
          <circle cx="0" cy="48" r="2.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
