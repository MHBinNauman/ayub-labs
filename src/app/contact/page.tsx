import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { pageTitles } from "@/lib/page-titles";
import { UNVERIFIED_HOURS_NOTE } from "@/components/sections/BranchCard";
import { EnquiryForm } from "@/components/sections/EnquiryForm";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { WeekHoursTable } from "@/components/sections/WeekHoursTable";
import { Breadcrumbs, Container } from "@/components/ui";
import { Reveal, REVEAL_STAGGER } from "@/components/ui/Reveal";
import { Tabs } from "@/components/ui/Tabs";
import { branches, contact, type Branch } from "@/data/site-data";
import { weekHoursTable } from "@/lib/hours";
import { mailto, mapsEmbed, tel, whatsapp } from "@/lib/links";
import { routes } from "@/lib/nav";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { cities, formatPhone, joinList, whatsappGreeting } from "@/lib/site";

const email = contact.email.value;
const intro = `Call, WhatsApp or email us, or visit one of our ${branches.length} branches in ${joinList(cities)}.`;

export const metadata: Metadata = pageMetadata({
  title: pageTitles.contact,
  description: intro,
  path: routes.contact,
});

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Contact", href: routes.contact },
];

const linkClass =
  "inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-blue";

function BranchPanel({ branch }: { branch: Branch }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-balance text-navy">
            {branch.name}
          </h2>
          <address className="mt-2 text-ink not-italic">
            {branch.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>

        <ul>
          {branch.phones.map((phone) => (
            <li key={phone}>
              <a href={tel(phone)} className={linkClass}>
                <Phone aria-hidden="true" className="size-4 text-brand-blue" />
                <span className="sr-only">Call </span>
                {formatPhone(phone)}
              </a>
            </li>
          ))}
          <li>
            <a href={mailto(email)} className={linkClass}>
              <Mail aria-hidden="true" className="size-4 text-brand-blue" />
              <span className="sr-only">Email </span>
              {email}
            </a>
          </li>
        </ul>

        <div>
          <h3 className="text-sm font-bold tracking-wider text-muted uppercase">
            Opening hours
          </h3>
          {!branch.hoursVerified && (
            <p className="mt-2 text-sm font-semibold text-brand-red-text">
              {UNVERIFIED_HOURS_NOTE}
            </p>
          )}
          <div className="mt-2 overflow-hidden rounded-card bg-white ring-1 ring-ink/10">
            <WeekHoursTable
              rows={weekHoursTable(branch)}
              caption={`Opening hours, ${branch.name}`}
            />
          </div>
        </div>
      </div>

      <div className="aspect-4/3 overflow-hidden rounded-card shadow-card ring-1 ring-ink/5">
        {/* Hidden tabs must not load a map, so every map waits to be asked for. */}
        <MapEmbed
          src={mapsEmbed(branch.mapQuery)}
          title={`Map of ${branch.name}`}
          label={branch.name}
          mode="on-request"
        />
      </div>
    </div>
  );
}

export default function ContactPage() {
  const primary = branches.find((branch) => branch.isPrimary) ?? branches[0];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <section className="bg-surface py-8 sm:py-10">
        <Container>
          <Breadcrumbs items={[crumbs[0], { label: crumbs[1].label }]} />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-balance text-navy sm:text-4xl">
            Contact us
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-pretty text-muted">
            {intro}
          </p>
        </Container>
      </section>

      <Container className="py-14 lg:py-20">
        <Reveal stagger={REVEAL_STAGGER} className="space-y-14 lg:space-y-20">
          <section aria-label="Our branches">
            <Tabs
              label="Branches"
              defaultTabId={primary.id}
              tabs={branches.map((branch) => ({
                id: branch.id,
                label: branch.name,
                content: <BranchPanel branch={branch} />,
              }))}
            />
          </section>

          <section
            aria-labelledby="enquiry-heading"
            className="rounded-card bg-surface p-6 sm:p-8"
          >
            <h2 id="enquiry-heading" className="text-2xl font-bold text-navy">
              Send us a message
            </h2>
            <p className="mt-2 max-w-2xl text-muted">
              Your message opens in your own WhatsApp or email app. This website
              doesn&apos;t store or send it anywhere.
            </p>
            <div className="mt-6">
              <EnquiryForm
                whatsappNumber={contact.whatsapp.number}
                email={email}
              />
            </div>
            <noscript>
              <p className="mt-6">
                <a
                  href={whatsapp(contact.whatsapp.number, whatsappGreeting)}
                  className={linkClass}
                >
                  <MessageCircle aria-hidden="true" className="size-5" />
                  Message us on WhatsApp
                </a>
              </p>
            </noscript>
          </section>
        </Reveal>
      </Container>
    </>
  );
}
