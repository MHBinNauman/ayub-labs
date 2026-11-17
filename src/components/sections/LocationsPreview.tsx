import { Navigation, Phone } from "lucide-react";
import { Button, Section, SectionHeading } from "@/components/ui";
import { BranchStatusChip } from "@/components/ui/BranchStatusChip";
import { branches } from "@/data/site-data";
import { mapsDirections, mapsEmbed, tel } from "@/lib/links";
import { cities, formatPhone, joinList } from "@/lib/site";
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
        {branches.map((branch) => {
          const directions =
            branch.googleMapsUrl ?? mapsDirections(branch.mapQuery);
          const callNumber = branch.phones[0];
          return (
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
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-navy">{branch.name}</h3>
                {/*
                 * Own line, so the chip changing width when it goes live can
                 * never re-wrap the heading and shift the card (CLS).
                 * Only the fields it needs cross into the client bundle.
                 */}
                <BranchStatusChip
                  branch={{
                    hours: branch.hours,
                    hoursVerified: branch.hoursVerified,
                  }}
                  className="mt-2 w-fit"
                />
                <address className="mt-3 text-ink not-italic">
                  {branch.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <ul className="mt-3 flex flex-wrap gap-x-4 text-sm">
                  {branch.phones.map((phone) => (
                    <li key={phone}>
                      <a
                        href={tel(phone)}
                        className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-blue"
                      >
                        <Phone
                          aria-hidden="true"
                          className="size-4 text-brand-blue"
                        />
                        <span className="sr-only">Call </span>
                        {formatPhone(phone)}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-3 pt-5">
                  <Button
                    href={directions}
                    target="_blank"
                    aria-label={`Directions to ${branch.name}`}
                  >
                    <Navigation aria-hidden="true" className="size-5" />
                    Directions
                  </Button>
                  {callNumber && (
                    <Button
                      href={tel(callNumber)}
                      variant="secondary"
                      aria-label={`Call ${branch.name}`}
                    >
                      <Phone aria-hidden="true" className="size-5" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
