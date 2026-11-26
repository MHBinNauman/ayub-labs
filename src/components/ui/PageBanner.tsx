import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { MediaItem } from "@/data/site-data";
import { bannerOverlayVars } from "@/lib/banner";
import { cn } from "@/lib/cn";
import { mediaProps } from "@/lib/media";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { Container } from "./Container";

type PageBannerProps = {
  /** The trail; the last crumb is the current page (shown without a link). */
  crumbs: Crumb[];
  title: ReactNode;
  /** One line under the H1. */
  intro?: ReactNode;
  /** The photo, from `media` in site-data.ts. */
  media: MediaItem;
  /** Small uppercase line above the H1, e.g. a category or "Rawalpindi · Saddar". */
  eyebrow?: ReactNode;
  /** Shown beside the eyebrow and H1, e.g. a service's icon tile. */
  icon?: ReactNode;
  /** Anything else for the banner, below the intro. */
  children?: ReactNode;
};

/**
 * The banner at the top of every inner page: a photo under a navy → logo
 * blue overlay (lib/banner.ts, contrast-tested), breadcrumb chips, a white
 * H1 and one line of intro.
 *
 * The photo is the page's LCP element, so it is preloaded at high priority
 * and never hidden. On desktop it drifts down at 0.15x the scroll
 * (.banner-parallax, CSS only); the layer reaches 15vh above the banner so
 * no gap opens. At least 200px tall on phones and 280px from lg; it grows
 * with its content.
 */
export function PageBanner({
  crumbs,
  title,
  intro,
  media,
  eyebrow,
  icon,
  children,
}: PageBannerProps) {
  const photo = mediaProps(media);

  return (
    <section
      data-page-banner=""
      aria-labelledby="page-title"
      style={bannerOverlayVars as CSSProperties}
      className="relative isolate overflow-hidden bg-navy text-white"
    >
      <div className="banner-parallax absolute inset-x-0 top-0 bottom-0 -z-20 lg:-top-[15vh]">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          preload
          fetchPriority="high"
          loading="eager"
          className="object-cover"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 banner-overlay"
      />

      <Container className="flex min-h-[200px] flex-col justify-end py-8 lg:min-h-[280px] lg:py-10">
        <Breadcrumbs items={crumbs} tone="onDark" />
        <div
          className={cn(
            "mt-6 lg:max-w-[50%]",
            icon && "flex items-start gap-4",
          )}
        >
          {icon}
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-sm font-semibold tracking-wide text-white/80 uppercase">
                {eyebrow}
              </div>
            )}
            <h1
              id="page-title"
              className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl"
            >
              {title}
            </h1>
          </div>
        </div>
        {intro && (
          <p className="mt-3 max-w-2xl text-lg text-pretty text-white/80 lg:max-w-[50%]">
            {intro}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}
