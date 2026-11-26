import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { branches, media } from "@/data/site-data";
import { mapsEmbed } from "@/lib/links";
import { mediaProps } from "@/lib/media";
import { cities, joinList } from "@/lib/site";
import { BranchContact } from "./BranchContact";
import { BranchSwitcher } from "./BranchSwitcher";
import { MapEmbed } from "./MapEmbed";

/**
 * Homepage locations: one card with a photo banner, a branch switch and, per
 * branch, the map beside the address, hours and Directions / Call buttons.
 */
export function LocationsPreview() {
  if (branches.length === 0) return null;
  const banner = mediaProps(media.banners.locations);

  return (
    <Section spacing="lg" aria-labelledby="locations-heading">
      <Reveal>
        <SectionHeading
          id="locations-heading"
          eyebrow="Locations"
          title="Visit a branch"
          sub={`${branches.length} ${branches.length === 1 ? "branch" : "branches"} in ${joinList(cities)}.`}
        />
      </Reveal>
      <Reveal className="mt-10">
        <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-ink/5">
          <div className="relative h-36 sm:h-44">
            <Image
              src={banner.src}
              alt={banner.alt}
              placeholder={banner.placeholder}
              blurDataURL={banner.blurDataURL}
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-r from-navy/85 via-navy/50 to-navy/10"
            />
            <p className="absolute inset-x-0 bottom-0 p-5 text-xl font-bold text-white sm:p-6 sm:text-2xl">
              {joinList(cities, "&")}
            </p>
          </div>
          <BranchSwitcher
            panels={branches.map((branch) => ({
              id: branch.id,
              label: branch.name,
              content: (
                <div className="grid lg:grid-cols-2">
                  <div className="aspect-video bg-tint lg:aspect-auto lg:min-h-80">
                    <MapEmbed
                      src={mapsEmbed(branch.mapQuery)}
                      title={`Map of ${branch.name}`}
                      label={branch.name}
                    />
                  </div>
                  <BranchContact branch={branch} className="p-6 lg:p-8" />
                </div>
              ),
            }))}
          />
        </div>
      </Reveal>
    </Section>
  );
}
