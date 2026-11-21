import {
  ArrowRight,
  Clock,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import { pageTitles } from "@/lib/page-titles";
import Link from "next/link";
import { UNVERIFIED_HOURS_NOTE } from "@/components/sections/BranchCard";
import { ReportRequestForm } from "@/components/sections/ReportRequestForm";
import { Breadcrumbs, Container } from "@/components/ui";
import { branches, contact, policies } from "@/data/site-data";
import { formatWeekHours } from "@/lib/hours";
import { whatsapp } from "@/lib/links";
import { routes } from "@/lib/nav";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { reportRequestMessage, resolvedFeatures } from "@/lib/site";

const portal = resolvedFeatures.reportPortalUrl;
const intro = portal
  ? "View and download your test report online, or collect it from the branch where your sample was taken."
  : "Ask for your test report on WhatsApp, or collect it from the branch where your sample was taken.";

export const metadata: Metadata = pageMetadata({
  title: pageTitles.reports,
  description: intro,
  path: routes.reports,
});

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Reports", href: routes.reports },
];

const portalSteps = [
  "Find the Lab No. on the receipt you got when your sample was taken.",
  "Open the report portal and enter the details printed on your receipt.",
  "View, download or print your report.",
];

function PortalCard({ url }: { url: string }) {
  return (
    <div className="rounded-card border-l-4 border-brand-red bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8">
      <h2 className="text-2xl font-bold text-navy">Open the report portal</h2>
      <ol className="mt-5 space-y-3">
        {portalSteps.map((step, index) => (
          <li key={step} className="flex gap-3 text-ink">
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white"
            >
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex min-h-14 items-center gap-2 rounded-lg bg-navy px-7 text-lg font-semibold text-white transition-colors hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        Open the report portal
        <ExternalLink aria-hidden="true" className="size-5" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}

function RequestCard() {
  const options = branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    whatsapp: branch.whatsapp ?? contact.whatsapp.number,
  }));
  return (
    <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 sm:p-8">
      <h2 className="text-2xl font-bold text-navy">
        Request your report on WhatsApp
      </h2>
      <p className="mt-2 max-w-2xl text-muted">
        Fill in the details from your receipt and we&apos;ll reply on WhatsApp.
      </p>
      <div className="mt-6">
        <ReportRequestForm branches={options} />
      </div>
      {/* Works without JavaScript too. */}
      <noscript>
        <p className="mt-6">
          <a
            href={whatsapp(contact.whatsapp.number, reportRequestMessage)}
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline underline-offset-4"
          >
            <MessageCircle aria-hidden="true" className="size-5" />
            Message us on WhatsApp
          </a>
        </p>
      </noscript>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <section className="bg-surface py-8 sm:py-10">
        <Container>
          <Breadcrumbs items={[crumbs[0], { label: crumbs[1].label }]} />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Your test report
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-pretty text-muted">
            {intro}
          </p>
        </Container>
      </section>

      <Container className="space-y-12 py-10 sm:py-12">
        {portal ? <PortalCard url={portal} /> : <RequestCard />}

        <section aria-labelledby="collect-heading">
          <h2 id="collect-heading" className="text-2xl font-bold text-navy">
            Collect in person
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {branches.map((branch) => (
              <li
                key={branch.id}
                className="flex flex-col rounded-card bg-surface p-6"
              >
                <h3 className="text-lg font-bold text-navy">{branch.name}</h3>
                <div className="mt-3 flex gap-3 text-sm text-ink">
                  <Clock
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-brand-blue"
                  />
                  <span>
                    <span className="sr-only">Opening hours: </span>
                    {formatWeekHours(branch).map((row) => (
                      <span key={row.days} className="block">
                        {row.label}
                      </span>
                    ))}
                    {!branch.hoursVerified && (
                      <span className="mt-1 block text-xs font-semibold text-brand-red-text">
                        {UNVERIFIED_HOURS_NOTE}
                      </span>
                    )}
                  </span>
                </div>
                <Link
                  href={`${routes.locations}/${branch.id}`}
                  className="group mt-3 inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold text-brand-blue focus-visible:outline-2 focus-visible:outline-brand-blue"
                >
                  Address and directions
                  <span className="sr-only">: {branch.name}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <p
            role="note"
            className="mt-6 flex max-w-2xl gap-3 rounded-md border-l-4 border-navy bg-tint px-4 py-3 text-sm text-ink"
          >
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-navy"
            />
            {policies.reportRelease.value}
          </p>
        </section>
      </Container>
    </>
  );
}
