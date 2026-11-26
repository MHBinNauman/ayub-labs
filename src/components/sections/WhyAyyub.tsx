import {
  BadgeCheck,
  CalendarCheck,
  MapPin,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { cacheLife } from "next/cache";
import type { ReactNode } from "react";
import { Section, SectionHeading } from "@/components/ui";
import { CountUp } from "@/components/ui/CountUp";
import { brand, branches } from "@/data/site-data";
import {
  joinList,
  keepHyphens,
  offersOneVisitCare,
  registeredWithShort,
  verifiedRegistrations,
  yearsServing,
} from "@/lib/site";

type Pillar = {
  /** Unique; also the React key. */
  id: string;
  title: ReactNode;
  text: string;
  Icon: LucideIcon;
};

/** yearsServing reads the clock; a day-long cache keeps the page static. */
async function cachedYearsServing() {
  "use cache";
  cacheLife("days");
  return yearsServing();
}

/**
 * Four reasons, each one a fact from site-data.ts. A pillar whose fact is
 * missing is dropped, never padded with an invented number.
 */
async function pillars(): Promise<Pillar[]> {
  const list: Pillar[] = [];

  const years = await cachedYearsServing();
  if (years) {
    list.push({
      id: "years",
      // Only this number counts up; the HTML already holds the final value.
      title: <CountUp value={years.years} suffix="+ years" />,
      text: `Serving patients since ${brand.foundedYear.value}.`,
      Icon: CalendarCheck,
    });
  }

  if (verifiedRegistrations.length > 0) {
    list.push({
      id: "registered",
      title: `Registered with ${registeredWithShort}`,
      text: `${joinList(verifiedRegistrations.map((r) => r.name))}.`,
      Icon: BadgeCheck,
    });
  }

  list.push({
    id: "branches",
    title: `${branches.length} ${branches.length === 1 ? "branch" : "branches"}`,
    text: `${joinList(
      branches.map((b) => b.name),
      "and",
    )}.`,
    Icon: MapPin,
  });

  if (offersOneVisitCare) {
    list.push({
      id: "one-visit",
      title: "Lab, clinic & pharmacy in one visit",
      text: "Have tests done, see a specialist and collect medicines without a second trip.",
      Icon: Stethoscope,
    });
  }

  return list;
}

export async function WhyAyyub() {
  const items = await pillars();

  return (
    <Section spacing="lg" background="surface" aria-labelledby="why-heading">
      <SectionHeading
        id="why-heading"
        eyebrow={`Why ${brand.shortName}`}
        title="Facts you can check"
        align="center"
      />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {items.map(({ id, title, text, Icon }) => (
          // Section reveals the heading, then each card in turn.
          <li
            key={id}
            data-reveal
            className="rounded-card border-t-4 border-brand-red bg-white p-6 shadow-card"
          >
            <span className="grid size-12 place-items-center rounded-full bg-tint text-brand-blue">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <h3 className="mt-4 text-xl font-bold text-balance text-navy">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted">{keepHyphens(text)}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
