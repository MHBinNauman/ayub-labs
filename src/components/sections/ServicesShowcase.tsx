import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui";
import { services } from "@/data/site-data";
import { routes, toServiceCard } from "@/lib/nav";
import { offeringPhrase, servicesByCategory } from "@/lib/site";
import { ServicesTabs, type ServiceTab } from "./ServicesTabs";

export function ServicesShowcase() {
  const cards = services.map(toServiceCard);
  const tabs: ServiceTab[] = [
    { id: "all", label: "All", slugs: cards.map((card) => card.slug) },
    ...servicesByCategory.map((group) => ({
      id: group.category,
      label: group.label,
      slugs: group.services.map((service) => service.slug),
    })),
  ];
  const offering = offeringPhrase();

  return (
    <Section spacing="lg" aria-labelledby="services-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          id="services-heading"
          eyebrow="Services"
          title="What we offer"
          sub={`${offering[0].toUpperCase()}${offering.slice(1)}.`}
        />
        <Link
          href={routes.services}
          className="inline-flex min-h-11 items-center font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          View all services
        </Link>
      </div>
      <ServicesTabs services={cards} tabs={tabs} />
    </Section>
  );
}
