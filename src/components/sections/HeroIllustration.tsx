import { cn } from "@/lib/cn";

/**
 * Flask, DNA helix and molecule line art that floats at the seam between the
 * hero copy and the photos. Drawn inline (no request) in white and logo red;
 * decorative only. The float lives in globals.css (.hero-float).
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 500"
      fill="none"
      className={cn("pointer-events-none text-white", className)}
    >
      {/* Molecule network */}
      <g stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5">
        <path d="M40 70 L95 40 L150 70 L150 130 L95 160 L40 130 Z" />
        <path d="M150 70 L205 40 L260 70" />
        <path d="M95 160 L95 215 L150 245" />
        <path d="M300 380 L345 355 L390 380 L390 430 L345 455 L300 430 Z" />
        <path d="M300 380 L255 355" />
      </g>
      <g fill="currentColor" fillOpacity="0.6">
        {[
          [40, 70, 4],
          [95, 40, 4],
          [150, 70, 5],
          [150, 130, 4],
          [95, 160, 5],
          [40, 130, 4],
          [205, 40, 4],
          [260, 70, 5],
          [95, 215, 4],
          [150, 245, 4],
          [300, 380, 5],
          [345, 355, 4],
          [390, 380, 4],
          [345, 455, 4],
          [255, 355, 4],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>

      {/* DNA helix */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path
          strokeOpacity="0.6"
          d="M330 40 C 290 80, 290 110, 330 150 S 370 220, 330 260 S 290 330, 330 370"
        />
        <path
          strokeOpacity="0.6"
          d="M330 40 C 370 80, 370 110, 330 150 S 290 220, 330 260 S 370 330, 330 370"
        />
        <g strokeOpacity="0.4" strokeWidth="1.5">
          <path d="M306 75 H354" />
          <path d="M302 110 H358" />
          <path d="M314 190 H346" />
          <path d="M304 222 H356" />
          <path d="M308 300 H352" />
          <path d="M302 332 H358" />
        </g>
      </g>

      {/* Flask */}
      <g transform="translate(118 200)">
        <path
          d="M52 0 H112 M62 0 V70 L0 190 Q-8 210 14 214 H150 Q172 210 164 190 L102 70 V0"
          fill="currentColor"
          fillOpacity="0.06"
          stroke="currentColor"
          strokeOpacity="0.9"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M30 132 H134 L160 186 Q166 202 150 204 H14 Q-2 202 4 186 Z"
          fill="currentColor"
          fillOpacity="0.3"
        />
        <circle cx="62" cy="168" r="7" fill="currentColor" fillOpacity="0.6" />
        <circle cx="96" cy="150" r="4" fill="currentColor" fillOpacity="0.6" />
        <circle cx="110" cy="178" r="5" fill="currentColor" fillOpacity="0.5" />
      </g>

      {/* Test tubes */}
      <g
        transform="translate(46 300)"
        stroke="currentColor"
        strokeOpacity="0.8"
        strokeWidth="2.5"
      >
        <rect x="0" y="0" width="22" height="120" rx="11" />
        <rect x="34" y="20" width="22" height="100" rx="11" />
        <path d="M-10 70 H66" strokeOpacity="0.5" />
      </g>
      <rect
        x="48.5"
        y="370"
        width="17"
        height="47"
        rx="8.5"
        fill="currentColor"
        fillOpacity="0.35"
      />
      <rect
        x="82.5"
        y="380"
        width="17"
        height="37"
        rx="8.5"
        className="fill-brand-red"
      />

      {/* Drop */}
      <path
        d="M200 120 C 200 120, 178 148, 178 162 A 22 22 0 0 0 222 162 C 222 148, 200 120, 200 120 Z"
        className="fill-brand-red"
      />
      <path
        d="M190 160 A 10 10 0 0 0 198 172"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
