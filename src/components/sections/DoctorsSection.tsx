import { UserRound } from "lucide-react";
import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui";
import type { doctors as doctorsData } from "@/data/site-data";

/**
 * Doctor roster. Rendered only when resolvedFeatures.doctorsSection is true
 * (it switches on once site-data.ts lists doctors); empty list → nothing.
 */
export function DoctorsSection({ doctors }: { doctors: typeof doctorsData }) {
  if (doctors.length === 0) return null;

  return (
    <Section spacing="lg" aria-labelledby="doctors-heading">
      <SectionHeading id="doctors-heading" eyebrow="Our team" title="Doctors" />
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {doctors.map((doctor) => (
          <li
            key={doctor.name}
            className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-ink/5"
          >
            <div className="relative grid aspect-square place-items-center bg-tint text-brand-blue">
              {doctor.photo ? (
                <Image
                  src={doctor.photo}
                  alt={doctor.name}
                  fill
                  sizes="(min-width: 64rem) 25vw, (min-width: 40rem) calc(50vw - 2.5rem), calc(100vw - 2rem)"
                  className="object-cover"
                />
              ) : (
                <UserRound aria-hidden="true" className="size-16" />
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-navy">{doctor.name}</h3>
              <p className="text-sm font-semibold text-ink">{doctor.title}</p>
              <p className="mt-1 text-sm text-muted">{doctor.qualifications}</p>
              {doctor.pmdcNo && (
                <p className="mt-2 text-sm text-muted">PMDC {doctor.pmdcNo}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
