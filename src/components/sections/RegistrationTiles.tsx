import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui";
import { joinList } from "@/lib/site";

export type RegistrationTile = {
  id: string;
  short: string;
  name: string;
  /** Always "Registered" (validate.ts enforces it). Never "accredited". */
  claim: string;
  explainer: string;
  logo: string;
  /** Names of the branches the registration covers. */
  covers: string[];
  registrationNo: string | null;
};

/**
 * Regulator badges with a one-line, plain-language explanation of what each
 * body does. Registration is the only trust claim the site makes.
 */
export function RegistrationTiles({ tiles }: { tiles: RegistrationTile[] }) {
  if (tiles.length === 0) return null;

  return (
    <Section
      spacing="lg"
      background="surface"
      aria-labelledby="registrations-heading"
    >
      <SectionHeading
        id="registrations-heading"
        eyebrow="Registrations"
        title="Who we are registered with"
      />
      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {tiles.map((tile) => (
          <li
            key={tile.id}
            className="flex flex-col gap-5 rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 sm:flex-row sm:items-start"
          >
            <div className="relative size-24 shrink-0">
              <Image
                src={tile.logo}
                alt={`${tile.name} logo`}
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-balance text-navy">
                {tile.name} ({tile.short})
              </h3>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <BadgeCheck
                  aria-hidden="true"
                  className="size-4 text-brand-blue"
                />
                {tile.claim}
              </p>
              <p className="mt-2 text-ink">{tile.explainer}</p>
              {tile.covers.length > 0 && (
                <p className="mt-2 text-sm text-muted">
                  Covers: {joinList(tile.covers)}
                </p>
              )}
              {tile.registrationNo && (
                <p className="mt-1 text-sm text-muted">
                  Registration no. {tile.registrationNo}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
