import type { Metadata } from "next";
import { BranchCard } from "@/components/sections/BranchCard";
import { BranchCardFrame } from "@/components/sections/BranchCardFrame";
import { LocationsControls } from "@/components/sections/LocationsControls";
import { LocationsMap } from "@/components/sections/LocationsMap";
import type { FinderBranch } from "@/components/sections/locations-types";
import { Container, PageBanner } from "@/components/ui";
import { Reveal, REVEAL_STAGGER } from "@/components/ui/Reveal";
import { branches, brand, media } from "@/data/site-data";
import { mapsEmbed } from "@/lib/links";
import { routes } from "@/lib/nav";
import { pageTitles } from "@/lib/page-titles";
import {
  branchJsonLd,
  breadcrumbJsonLd,
  JsonLd,
  pageMetadata,
} from "@/lib/seo";
import { cities, cityId, joinList, keepHyphens } from "@/lib/site";

const intro = `${branches.length} branches in ${joinList(cities)}: ${joinList(branches.map((b) => b.name))}.`;

export const metadata: Metadata = pageMetadata({
  title: pageTitles.locations,
  description: `Addresses, opening hours, phone numbers and directions for ${brand.displayName}. ${intro}`,
  path: routes.locations,
});

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Locations", href: routes.locations },
];

export default function LocationsPage() {
  // Only what the client islands need crosses to the browser.
  const finderBranches: FinderBranch[] = branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    area: branch.area,
    hours: branch.hours,
    hoursVerified: branch.hoursVerified,
    cityId: cityId(branch.city),
    mapSrc: mapsEmbed(branch.mapQuery),
  }));
  const refs = finderBranches.map(({ id, cityId }) => ({ id, cityId }));
  const cityOptions = cities.map((city) => ({ id: cityId(city), label: city }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {branches.map((branch) => (
        <JsonLd key={branch.id} data={branchJsonLd(branch)} />
      ))}

      <PageBanner
        crumbs={[crumbs[0], { label: crumbs[1].label }]}
        title={pageTitles.locations}
        intro={keepHyphens(intro)}
        media={media.banners.locations}
      />

      <Container className="py-14 lg:py-20">
        <Reveal stagger={REVEAL_STAGGER}>
          {/* Row 1: finder (40%) and map (60%). The map is desktop only. */}
          <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
            <LocationsControls branches={finderBranches} cities={cityOptions} />
            <div
              id="locations-map"
              className="hidden h-[28rem] overflow-hidden rounded-card shadow-card ring-1 ring-ink/5 lg:block"
            >
              <LocationsMap branches={finderBranches} />
            </div>
          </div>

          {/* Row 2: one card per branch. */}
          <ul
            aria-label="Branch details"
            className="mt-10 grid gap-6 md:grid-cols-2"
          >
            {branches.map((branch) => (
              <BranchCardFrame
                key={branch.id}
                branchId={branch.id}
                branches={refs}
              >
                <BranchCard branch={branch} />
              </BranchCardFrame>
            ))}
          </ul>
        </Reveal>
      </Container>
    </>
  );
}
