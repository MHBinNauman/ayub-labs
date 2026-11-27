import Image from "next/image";
import Link from "next/link";
import { brand } from "@/data/site-data";
import { cn } from "@/lib/cn";

/** See public/brand/README.md. Swap for the vector file once the client supplies one. */
export const EMBLEM_SRC = "/brand/logo-emblem-192.png";

type LogoProps = {
  /** "lg" grows the lock-up on desktop (header band); "md" stays compact. */
  size?: "md" | "lg";
  /** Load the emblem straight away. Only for the copy above the fold (header band). */
  eager?: boolean;
  className?: string;
};

/**
 * Emblem image plus the wordmark and tagline as live text, so the name stays
 * crisp at every size. For navy backgrounds. The emblem is decorative: the
 * text beside it names the link.
 *
 * A logotype, so it is exempt from the 14px text floor (data-type-exempt,
 * checked in e2e/mobile-qa.spec.ts): below 380px the name is 13px and the
 * tagline 10-11px, which is what fits beside the header buttons.
 */
export function Logo({ size = "lg", eager = false, className }: LogoProps) {
  const large = size === "lg";
  return (
    <Link
      href="/"
      data-type-exempt=""
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-md transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:gap-3",
        className,
      )}
    >
      <span
        className={cn(
          "size-11 shrink-0 overflow-hidden rounded-full bg-white p-0.5",
          large && "lg:size-15",
        )}
      >
        <Image
          src={EMBLEM_SRC}
          alt=""
          width={192}
          height={192}
          sizes={large ? "(min-width: 64rem) 60px, 44px" : "44px"}
          loading={eager ? "eager" : "lazy"}
          className="size-full"
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            // Below 360px the name wraps onto two lines rather than run
            // under the header buttons.
            "text-[0.8125rem] leading-tight font-extrabold tracking-wide text-white uppercase min-[360px]:whitespace-nowrap min-[380px]:text-sm sm:text-base",
            large && "lg:text-[1.375rem]",
          )}
        >
          {brand.displayName}
        </span>
        {brand.tagline.verified && (
          <span
            className={cn(
              // Hidden below 360px, where it cannot fit; the emblem carries it too.
              "mt-0.5 hidden text-[0.625rem] leading-tight font-semibold tracking-[0.16em] whitespace-nowrap text-white/80 uppercase min-[360px]:block sm:text-[0.6875rem]",
              large && "lg:mt-1 lg:text-xs lg:tracking-[0.2em]",
            )}
          >
            {brand.tagline.value}
          </span>
        )}
      </span>
    </Link>
  );
}
