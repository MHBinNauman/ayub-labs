import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Section, SectionHeading } from "@/components/ui";
import { brand, media, type MediaItem } from "@/data/site-data";
import { mediaProps } from "@/lib/media";
import { routes } from "@/lib/nav";
import { keepHyphens, whyChooseItems } from "@/lib/site";

type AboutSplitProps = {
  /** Id of the section's h2, unique on the page. */
  headingId: string;
  eyebrow: string;
  title: string;
  /** The left panel's photo, from `media` in site-data.ts. */
  photo: MediaItem;
  /** The About copy under the photo. */
  body: string;
  /** Shown under the copy, e.g. the dev-only draft-copy notice. */
  note?: ReactNode;
  /** A link under the copy, e.g. "Read our story" on the homepage. */
  link?: { href: string; label: string };
  /** Heading of the checklist panel. */
  checklistTitle: string;
  /** Checklist lines, each a fact from site-data.ts. */
  items: readonly string[];
};

/**
 * The template's split About panels on a tint→white band. Left: photo with
 * a floating "Since" card, the About copy and an optional link. Right: a
 * checklist of facts with brand-blue ticks. A panel with nothing to show is
 * dropped; with neither, the section is not rendered. Section reveals the
 * heading, then each panel in turn. Used by the homepage (AboutTeaser) and
 * /about ("Our lab").
 */
export function AboutSplit({
  headingId,
  eyebrow,
  title,
  photo: photoItem,
  body,
  note,
  link,
  checklistTitle,
  items,
}: AboutSplitProps) {
  const about = body.trim();
  const founded = brand.foundedYear.verified ? brand.foundedYear.value : null;
  const photo = mediaProps(photoItem);

  if (!about && items.length === 0) return null;

  return (
    <Section spacing="lg" background="fade" aria-labelledby={headingId}>
      <SectionHeading id={headingId} eyebrow={eyebrow} title={title} />
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        {about && (
          <div data-reveal>
            <div className="relative pb-6">
              <div className="relative aspect-[16/10] overflow-hidden rounded-card shadow-card">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  placeholder={photo.placeholder}
                  blurDataURL={photo.blurDataURL}
                  sizes="(min-width: 1280px) 584px, (min-width: 1024px) 45vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
                  className="size-full object-cover"
                />
              </div>
              {founded && (
                <p className="absolute bottom-0 left-5 rounded-xl bg-white px-5 py-3 shadow-card-hover ring-1 ring-ink/5">
                  <span className="block text-sm font-semibold tracking-wide text-muted uppercase">
                    Since
                  </span>
                  <span className="block text-2xl font-extrabold text-navy">
                    {founded}
                  </span>
                </p>
              )}
            </div>
            <p className="mt-6 text-lg text-pretty text-ink">
              {keepHyphens(about)}
            </p>
            {note}
            {link && (
              <Link
                href={link.href}
                className="group mt-5 inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                {link.label}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-brand-red group-hover:translate-x-1 motion-safe:transition-transform motion-safe:duration-300"
                />
              </Link>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div data-reveal>
            <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8">
              <h3 className="text-xl font-bold text-navy sm:text-2xl">
                {checklistTitle}
              </h3>
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tint text-brand-blue">
                      <Check
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={3}
                      />
                    </span>
                    <span className="pt-0.5 font-medium text-ink">
                      {keepHyphens(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

/** The homepage's About teaser: "Who we are", linking to /about. */
export function AboutTeaser({
  items = whyChooseItems,
}: {
  /** The checklist. Defaults to the derived list; tests pass their own. */
  items?: readonly string[];
}) {
  return (
    <AboutSplit
      headingId="about-heading"
      eyebrow="About us"
      title="Who we are"
      photo={media.banners.about}
      body={brand.aboutDraft}
      link={{ href: routes.about, label: "Read our story" }}
      checklistTitle={`Why choose ${brand.shortName}`}
      items={items}
    />
  );
}
