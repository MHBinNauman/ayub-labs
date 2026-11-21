import {
  HeartHandshake,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui";

export type PromisePoint = { id: string; title: string; text: string };

const icons: Record<string, LucideIcon> = {
  reliable: ShieldCheck,
  access: MapPin,
  care: HeartHandshake,
};

/**
 * The tagline from the logo emblem as a heading, with what it means in
 * practice: points from site-data.ts (qualityPromise), each a restatement of
 * the client's own About text.
 */
export function QualityPromise({
  tagline,
  points,
}: {
  tagline: string;
  points: PromisePoint[];
}) {
  if (points.length === 0) return null;

  return (
    <Section spacing="lg" aria-labelledby="promise-heading">
      <SectionHeading
        id="promise-heading"
        eyebrow="Our promise"
        title={`“${tagline}”`}
        sub="The words on our emblem, and what they mean for every patient."
        align="center"
      />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {points.map((point) => {
          const Icon = icons[point.id] ?? ShieldCheck;
          return (
            <li
              key={point.id}
              className="rounded-card border-t-4 border-brand-red bg-white p-6 shadow-card ring-1 ring-ink/5"
            >
              <span className="grid size-12 place-items-center rounded-full bg-tint text-brand-blue">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-balance text-navy">
                {point.title}
              </h3>
              <p className="mt-2 text-muted">{point.text}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
