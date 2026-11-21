import { FileQuestion, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BranchContact } from "@/components/sections/BranchContact";
import { TestTable } from "@/components/sections/TestTable";
import { Breadcrumbs, Button, Container } from "@/components/ui";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import {
  contact,
  serviceCategories,
  services,
  type Service,
} from "@/data/site-data";
import { tel, whatsapp } from "@/lib/links";
import { routes, serviceHref, toServiceCard } from "@/lib/nav";
import {
  breadcrumbJsonLd,
  JsonLd,
  pageMetadata,
  serviceJsonLd,
} from "@/lib/seo";
import { serviceIcon } from "@/lib/service-icons";
import {
  branchesOffering,
  primaryPhone,
  serviceQuestionMessage,
} from "@/lib/site";

// Every service is prerendered. Unknown slugs are rendered on request and
// 404 via notFound() (dynamicParams is not allowed with Cache Components).
/*
 * The whole page depends on the slug, so it reads params up front instead of
 * behind a <Suspense> skeleton (`instant = false` allows that).
 *
 * `ensureStatic = "navigation"` requires the complete page to be static
 * output. It also changes what an unknown slug gets: instead of the generic
 * fallback shell with a 200 status, Next renders the page for that slug,
 * where notFound() produces a real 404.
 */
export const instant = false;
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

function findService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = findService((await params).slug);
  if (!service) notFound();
  return pageMetadata({
    title: service.name,
    description: service.summary,
    path: serviceHref(service.slug),
  });
}

/** Visible only under `next dev`; the condition is compiled out of production builds. */
function DraftCopyNotice({ service }: { service: Service }) {
  if (process.env.NODE_ENV !== "development" || service.copyApproved) {
    return null;
  }
  return (
    <p
      role="note"
      className="mt-4 max-w-2xl rounded-md border-l-4 border-brand-red bg-white px-4 py-2 text-sm text-ink"
    >
      <strong className="text-brand-red-text">Draft copy.</strong> The client
      has not approved this description yet. (Shown in development only.)
    </p>
  );
}

function AskAboutTests({ service }: { service: Service }) {
  return (
    <div className="rounded-card border-l-4 border-brand-red bg-surface p-6 sm:p-8">
      <span className="grid size-12 place-items-center rounded-full bg-white text-brand-blue shadow-card">
        <FileQuestion aria-hidden="true" className="size-6" />
      </span>
      <h2 className="mt-4 text-2xl font-bold text-navy">
        Ask about tests and prices
      </h2>
      <p className="mt-2 max-w-xl text-muted">
        The {service.name} test list and prices are not online yet. Message us
        on WhatsApp and our team will tell you what is available.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          href={whatsapp(
            contact.whatsapp.number,
            serviceQuestionMessage(service.name),
          )}
          target="_blank"
          variant="whatsapp"
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          Ask on WhatsApp
        </Button>
        <Button href={tel(primaryPhone.e164)} variant="secondary">
          <Phone aria-hidden="true" className="size-5" />
          Call {primaryPhone.display}
        </Button>
      </div>
    </div>
  );
}

export default async function ServicePage({
  params,
}: PageProps<"/services/[slug]">) {
  const service = findService((await params).slug);
  if (!service) notFound();

  const category = serviceCategories[service.category];
  const related = services.filter(
    (other) =>
      other.category === service.category && other.slug !== service.slug,
  );
  const offeredAt = branchesOffering(service);
  const structured = serviceJsonLd(service);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: routes.services },
    { label: service.name, href: serviceHref(service.slug) },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {structured && <JsonLd data={structured} />}

      <section className="bg-surface py-8 sm:py-10">
        <Container>
          <Breadcrumbs
            items={[crumbs[0], crumbs[1], { label: service.name }]}
          />
          <div className="mt-6 flex items-start gap-4">
            {serviceIcon(service.icon) && (
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-brand-blue shadow-card sm:size-16">
                <ServiceIcon name={service.icon} className="size-7 sm:size-8" />
              </span>
            )}
            <div className="min-w-0">
              <Link
                href={`${routes.services}?category=${service.category}`}
                className="inline-flex min-h-11 items-center text-sm font-semibold tracking-wide text-brand-red-text uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-blue"
              >
                {category.label}
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-balance text-navy sm:text-4xl">
                {service.name}
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-lg text-pretty text-ink">
            {service.summary}
          </p>
          <DraftCopyNotice service={service} />

          {offeredAt.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-muted">
                Available at
              </span>
              <ul className="flex flex-wrap gap-2">
                {offeredAt.map((branch) => (
                  <li key={branch.id}>
                    <Link
                      href={`${routes.locations}/${branch.id}`}
                      className="inline-flex min-h-11 items-center rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold text-navy transition-colors hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
                    >
                      {branch.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      {/*
       * DOM order is content → branches → related, so phones read the branch
       * card at the bottom of the main content; from lg the aside moves to a
       * sticky right column spanning both rows. One markup for both layouts.
       */}
      <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 lg:py-20">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          {service.tests.length > 0 ? (
            <TestTable tests={service.tests} serviceName={service.name} />
          ) : (
            <AskAboutTests service={service} />
          )}
        </div>

        <aside
          aria-labelledby="visit-heading"
          className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        >
          <h2 id="visit-heading" className="text-xl font-bold text-navy">
            Visit or call
          </h2>
          <ul className="mt-4 divide-y divide-ink/10">
            {offeredAt.map((branch) => (
              <li key={branch.id} className="py-5 first:pt-0 last:pb-0">
                <BranchContact branch={branch} compact />
              </li>
            ))}
          </ul>
        </aside>

        {related.length > 0 && (
          <section
            aria-labelledby="related-heading"
            className="min-w-0 lg:col-start-1 lg:row-start-2"
          >
            <h2 id="related-heading" className="text-2xl font-bold text-navy">
              More in {category.label}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:gap-6">
              {related.map((other) => (
                <ServiceCard key={other.slug} service={toServiceCard(other)} />
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
