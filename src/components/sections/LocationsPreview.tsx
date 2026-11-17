import { Section, SectionHeading } from "@/components/ui";
import { branches } from "@/data/site-data";
import { mapsEmbed } from "@/lib/links";
import { cities, joinList } from "@/lib/site";
import { BranchContact } from "./BranchContact";
import { MapEmbed } from "./MapEmbed";

export function LocationsPreview() {
  return (
    <Section spacing="lg" aria-labelledby="locations-heading">
      <SectionHeading
        id="locations-heading"
        eyebrow="Locations"
        title="Visit a branch"
        sub={`${branches.length} branches in ${joinList(cities)}.`}
      />
      <ul className="mt-10 grid gap-6 lg:grid-cols-2">
        {branches.map((branch) => (
          <li
            key={branch.id}
            className="flex flex-col overflow-hidden rounded-card bg-white shadow-card ring-1 ring-ink/5"
          >
            <div className="aspect-video bg-tint">
              <MapEmbed
                src={mapsEmbed(branch.mapQuery)}
                title={`Map of ${branch.name}`}
                label={branch.name}
              />
            </div>
            <BranchContact branch={branch} className="flex-1 p-6" />
          </li>
        ))}
      </ul>
    </Section>
  );
}
