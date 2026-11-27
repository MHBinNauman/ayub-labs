import Image from "next/image";
import { HexPattern } from "@/components/ui/HexPattern";
import { brand } from "@/data/site-data";
import { splashBodyScript } from "@/lib/splash";
import { EMBLEM_SRC } from "./Logo";
import { SplashGate } from "./SplashGate";

/**
 * Branded loading screen, shown once per browser session (see lib/splash.ts).
 * In the HTML from the first byte, laid over a page that renders normally
 * underneath, so it never delays the content. Nothing in it takes focus.
 * Animation is in globals.css and off under reduced motion.
 */
export function Splash() {
  return (
    <>
      <SplashGate>
        <div
          role="status"
          aria-label={`Loading ${brand.displayName}`}
          className="splash fixed inset-0 z-60 overflow-hidden bg-linear-to-br from-navy to-brand-blue text-white"
        >
          <HexPattern />
          <div
            aria-hidden="true"
            className="relative flex h-full flex-col items-center justify-center px-4 text-center"
          >
            <div className="relative size-28 sm:size-32">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                className="absolute -inset-3 size-[calc(100%+1.5rem)] -rotate-90"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  pathLength="1"
                  stroke="currentColor"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="splash-ring"
                />
              </svg>
              <span className="splash-emblem block size-full overflow-hidden rounded-full bg-white p-1">
                <Image
                  src={EMBLEM_SRC}
                  alt=""
                  width={192}
                  height={192}
                  sizes="128px"
                  loading="eager"
                  className="size-full"
                />
              </span>
            </div>

            <div className="mt-9 w-fit">
              <p className="splash-rise text-base font-extrabold tracking-[0.08em] whitespace-nowrap uppercase min-[380px]:text-xl sm:text-3xl">
                {brand.displayName}
              </p>
              {brand.tagline.verified && (
                // Part of the logotype lock-up: exempt from the 14px floor.
                <p
                  data-type-exempt=""
                  className="splash-rise splash-rise-late mt-2 text-[0.6875rem] font-semibold tracking-[0.2em] whitespace-nowrap text-white/85 uppercase sm:text-sm"
                >
                  {brand.tagline.value}
                </p>
              )}
              <div className="mt-6 h-0.5 overflow-hidden rounded-full bg-white/15">
                <div className="splash-line h-full origin-left bg-brand-red" />
              </div>
            </div>
          </div>
        </div>
      </SplashGate>
      <script dangerouslySetInnerHTML={{ __html: splashBodyScript }} />
    </>
  );
}
