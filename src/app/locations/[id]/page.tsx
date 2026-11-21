import { MessageCircle, Navigation, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UNVERIFIED_HOURS_NOTE } from "@/components/sections/BranchCard";
import { CopyAddressButton } from "@/components/sections/CopyAddressButton";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { WeekHoursTable } from "@/components/sections/WeekHoursTable";
import { Breadcrumbs, Button, Container } from "@/components/ui";
import { BranchStatusChip } from "@/components/ui/BranchStatusChip";
import { branches, serviceCategories, type Branch } from "@/data/site-data";
import { formatWeekHours, weekHoursTable } from "@/lib/hours";
import { mapsDirections, mapsEmbed, tel, whatsapp } from "@/lib/links";
import { routes, serviceHref } from "@/lib/nav";
import { branchTitle } from "@/lib/page-titles";
import {
  branchJsonLd,
  breadcrumbJsonLd,
  JsonLd,
  pageMetadata,
} from "@/lib/seo";
import {
  addressText,
  branchWhatsappMessage,
  formatPhone,
  registrationsFor,
  servicesAt,
} from "@/lib/site";

/*
 * Same setup as /services/[slug]: every branch is prerendered, the page reads
 * params up front (`instant = false`), and `ensureStatic = "navigation"`
 * keeps it fully static and gives unknown ids a real 404.
 */
export const instant = false;
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return branches.map((branch) => ({ id: branch.id }));
}

function findBranch(id: string): Branch | undefined {
  return branches.find((branch) => branch.id === id);
}

export async function generateMetadata({
  params,
}: PageProps<"/locations/[id]">): Promise<Metadata> {
  const branch = findBranch((await params).id);
  if (!branch) notFound();
  const hours = branch.hoursVerified
    ? ` Open ${formatWeekHours(branch)
        .filter((row) => !row.closed)
        .map((row) => row.label)
        .join(", ")}.`
    : "";
  return pageMetadata({
    title: branchTitle(branch),
    description: `${branch.addressLines.join(", ")}.${hours} Directions, phone and services.`,
    path: `${routes.locations}/${branch.id}`,
  });
}

export default async function BranchPage({
  params,
}: PageProps<"/locations/[id]">) {
  const branch = findBranch((await params).id);
  if (!branch) notFound();

  const directions = branch.googleMapsUrl ?? mapsDirections(branch.mapQuery);
  const registrations = registrationsFor(branch);
  const offered = servicesAt(branch);
  const serviceGroups = (
    Object.keys(serviceCategories) as (keyof typeof serviceCategories)[]
  )
    .map((category) => ({
      category,
      label: serviceCategories[category].label,
      items: offered.filter((service) => service.category === category),
    }))
    .filter((group) => group.items.length > 0);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Locations", href: routes.locations },
    { label: branch.name, href: `${routes.locations}/${branch.id}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={branchJsonLd(branch)} />

      <section className="bg-surface py-8 sm:py-10">
        <Container>
          <Breadcrumbs items={[crumbs[0], crumbs[1], { label: branch.name }]} />
          <p className="mt-6 text-sm font-semibold tracking-wide text-brand-red-text uppercase">
            {branch.city} · {branch.area}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {branch.name}
          </h1>
          <BranchStatusChip
            branch={{
              hours: branch.hours,
              hoursVerified: branch.hoursVerified,
            }}
            className="mt-3 w-fit"
          />
        </Container>
      </section>

      <Container className="grid gap-10 py-10 sm:py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="address-heading">
            <h2 id="address-heading" className="text-xl font-bold text-navy">
              Address
            </h2>
            <address className="mt-3 text-lg text-ink not-italic">
              {branch.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <div className="mt-3">
              <CopyAddressButton text={addressText(branch)} />
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-5">
              {branch.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={tel(phone)}
                    className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-blue"
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
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                href={directions}
                target="_blank"
                aria-label={`Directions to ${branch.name}`}
              >
                <Navigation aria-hidden="true" className="size-5" />
                Directions
              </Button>
              {branch.phones[0] && (
                <Button
                  href={tel(branch.phones[0])}
                  variant="secondary"
                  aria-label={`Call ${branch.name}`}
                >
                  <Phone aria-hidden="true" className="size-5" />
                  Call
                </Button>
              )}
              {branch.whatsapp && (
                <Button
                  href={whatsapp(
                    branch.whatsapp,
                    branchWhatsappMessage(branch),
                  )}
                  target="_blank"
                  variant="whatsapp"
                  aria-label={`WhatsApp ${branch.name}`}
                >
                  <MessageCircle aria-hidden="true" className="size-5" />
                  WhatsApp
                </Button>
              )}
            </div>
          </section>

          <section aria-labelledby="hours-heading">
            <h2 id="hours-heading" className="text-xl font-bold text-navy">
              Opening hours
            </h2>
            {!branch.hoursVerified && (
              <p
                role="note"
                className="mt-3 rounded-md border-l-4 border-brand-red bg-surface px-4 py-2 text-sm font-semibold text-ink"
              >
                {UNVERIFIED_HOURS_NOTE}
              </p>
            )}
            <div className="mt-3 overflow-hidden rounded-card bg-white shadow-card ring-1 ring-ink/5">
              <WeekHoursTable
                rows={weekHoursTable(branch)}
                caption={`Opening hours, ${branch.name}`}
              />
            </div>
          </section>
        </div>

        <div className="min-w-0">
          <div className="aspect-4/3 overflow-hidden rounded-card shadow-card ring-1 ring-ink/5 lg:sticky lg:top-20">
            <MapEmbed
              src={mapsEmbed(branch.mapQuery)}
              title={`Map of ${branch.name}`}
              label={branch.name}
            />
          </div>
        </div>
      </Container>

      {serviceGroups.length > 0 && (
        <section
          aria-labelledby="services-heading"
          className="bg-surface py-12 sm:py-16"
        >
          <Container>
            <h2 id="services-heading" className="text-2xl font-bold text-navy">
              Services available
            </h2>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {serviceGroups.map((group) => (
                <div key={group.category}>
                  <h3 className="text-xs font-bold tracking-wider text-muted uppercase">
                    {group.label}
                  </h3>
                  <ul className="mt-2">
                    {group.items.map((service) => (
                      <li key={service.slug}>
                        <Link
                          href={serviceHref(service.slug)}
                          className="inline-flex min-h-11 items-center font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-blue"
                        >
                          {service.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {registrations.length > 0 && (
        <section
          aria-labelledby="registrations-heading"
          className="py-12 sm:py-16"
        >
          <Container>
            <h2
              id="registrations-heading"
              className="text-2xl font-bold text-navy"
            >
              Registered with
            </h2>
            <ul className="mt-6 flex flex-wrap gap-4">
              {registrations.map((registration) => (
                <li
                  key={registration.id}
                  className="flex items-center gap-4 rounded-card bg-white p-4 pr-6 shadow-card ring-1 ring-ink/5"
                >
                  <span className="relative block size-16 shrink-0">
                    <Image
                      src={registration.logo}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </span>
                  <span>
                    <span className="block font-bold text-navy">
                      {registration.name}
                    </span>
                    <span className="block text-sm text-muted">
                      {registration.claim} · {registration.short}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
