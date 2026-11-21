import type { Metadata } from "next";
import { pageTitles } from "@/lib/page-titles";
import { Breadcrumbs, Container } from "@/components/ui";
import { ServicesBrowser } from "@/components/sections/ServicesBrowser";
import { branches, contact, services } from "@/data/site-data";
import { QUERY_TOKEN } from "@/lib/message-template";
import { routes, toSearchableService } from "@/lib/nav";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import {
  cities,
  joinList,
  offeringPhrase,
  searchQuestionMessage,
  servicesByCategory,
} from "@/lib/site";

const offering = offeringPhrase();
const intro = `${offering[0].toUpperCase()}${offering.slice(1)}, at ${branches.length} branches in ${joinList(cities)}.`;

export const metadata: Metadata = pageMetadata({
  title: pageTitles.services,
  description: intro,
  path: routes.services,
});

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Services", href: routes.services },
];

export default function ServicesPage() {
  const props = {
    services: services.map(toSearchableService),
    categories: servicesByCategory.map((group) => ({
      id: group.category,
      label: group.label,
    })),
    whatsappNumber: contact.whatsapp.number,
    askTemplate: searchQuestionMessage(QUERY_TOKEN),
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <section className="bg-surface py-8 sm:py-10">
        <Container>
          <Breadcrumbs items={[crumbs[0], { label: crumbs[1].label }]} />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Services
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-pretty text-muted">
            {intro}
          </p>
        </Container>
      </section>

      <Container className="py-10 sm:py-12">
        {/*
         * Prerendered unfiltered, so the static HTML lists every service;
         * the island applies ?category= and ?q= once it runs in the browser.
         */}
        <ServicesBrowser {...props} />
      </Container>
    </>
  );
}
