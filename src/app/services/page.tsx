import type { Metadata } from "next";
import { pageTitles } from "@/lib/page-titles";
import { Container, PageBanner } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { ServicesBrowser } from "@/components/sections/ServicesBrowser";
import { branches, contact, media, services } from "@/data/site-data";
import { QUERY_TOKEN } from "@/lib/message-template";
import { routes, toSearchableService } from "@/lib/nav";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import {
  cities,
  joinList,
  offeringPhrase,
  searchQuestionMessage,
  servicesByCategory,
  keepHyphens,
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
      <PageBanner
        crumbs={[crumbs[0], { label: crumbs[1].label }]}
        title="Services"
        intro={keepHyphens(intro)}
        media={media.banners.services}
      />

      <Container className="py-14 lg:py-20">
        {/*
         * Prerendered unfiltered, so the static HTML lists every service;
         * the island applies ?category= and ?q= once it runs in the browser.
         */}
        {/* An interactive tool: it reveals as one block, never per row. */}
        <Reveal>
          <ServicesBrowser {...props} />
        </Reveal>
      </Container>
    </>
  );
}
