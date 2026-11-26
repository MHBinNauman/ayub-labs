import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui";
import { brand, media } from "@/data/site-data";
import { mediaProps } from "@/lib/media";
import { routes } from "@/lib/nav";
import { keepHyphens, whyChooseItems } from "@/lib/site";

/**
 * Homepage "About" split panels on a tint→white band. Left: photo with a
 * floating "Since" card, the About copy and a link to /about. Right: the
 * "Why choose" checklist, every line a fact from site-data.ts. A panel with
 * nothing to show is dropped; with neither, the section is not rendered.
 * Section reveals the heading, then each panel in turn.
 */
export function AboutTeaser({
  items = whyChooseItems,
}: {
  /** The checklist. Defaults to the derived list; tests pass their own. */
  items?: readonly string[];
}) {
  const about = brand.aboutDraft.trim();
  const founded = brand.foundedYear.verified ? brand.foundedYear.value : null;
  const photo = mediaProps(media.banners.about);

  if (!about && items.length === 0) return null;

  return (
    <Section spacing="lg" background="fade" aria-labelledby="about-heading">
      <SectionHeading
        id="about-heading"
        eyebrow="About us"
        title="Who we are"
      />
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
                  sizes="(min-width: 1280px) 584px, (min-width: 1024px) 45vw, 100vw"
                  className="size-full object-cover"
                />
              </div>
              {founded && (
                <p className="absolute bottom-0 left-5 rounded-xl bg-white px-5 py-3 shadow-card-hover ring-1 ring-ink/5">
                  <span className="block text-xs font-semibold tracking-wide text-muted uppercase">
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
            <Link
              href={routes.about}
              className="group mt-5 inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              Read our story
              <ArrowRight
                aria-hidden="true"
                className="size-4 text-brand-red group-hover:translate-x-1 motion-safe:transition-transform motion-safe:duration-300"
              />
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div data-reveal>
            <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8">
              <h3 className="text-xl font-bold text-navy sm:text-2xl">
                Why choose {brand.shortName}
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
