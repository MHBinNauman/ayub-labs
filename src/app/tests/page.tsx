import { FlaskConical } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  TestDirectory,
  type ServiceOption,
} from "@/components/sections/TestDirectory";
import { Breadcrumbs, Container } from "@/components/ui";
import { contact, services } from "@/data/site-data";
import { QUERY_TOKEN } from "@/lib/message-template";
import { routes } from "@/lib/nav";
import { pageTitles } from "@/lib/page-titles";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import {
  directoryTests,
  resolvedFeatures,
  searchQuestionMessage,
  testBookingTemplate,
} from "@/lib/site";

const enabled = resolvedFeatures.testDirectory;
const intro =
  "Search our tests by name, other name or code, and book on WhatsApp.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: pageTitles.tests,
    description: intro,
    path: routes.tests,
  }),
  // Never indexed while the directory is switched off.
  ...(!enabled && { robots: { index: false, follow: false } }),
};

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Tests", href: routes.tests },
];

const serviceOptions: ServiceOption[] = services
  .filter((service) => service.tests.length > 0)
  .map((service) => ({ slug: service.slug, name: service.name }));

// Name order, so the static HTML matches the client's first render.
const tests = [...directoryTests].sort((a, b) =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
);

/** Shown only under `next dev` while features.testDirectory is off. */
function DevBanner() {
  return (
    <div
      role="note"
      className="mt-6 max-w-3xl rounded-md border-l-4 border-brand-red bg-white px-4 py-3 text-sm text-ink"
    >
      <p>
        <strong className="text-brand-red-text">
          Test directory is switched off.
        </strong>{" "}
        <code>features.testDirectory</code> is <code>false</code>, so this page
        returns 404 in production. (Shown in development only.)
      </p>
      <p className="mt-2">
        To publish it: save the price list as <code>data/tests.csv</code>, run{" "}
        <code>pnpm import-tests</code>, then set{" "}
        <code>features.testDirectory: true</code> in site-data.ts.{" "}
        {tests.length === 0
          ? "No tests have been imported yet."
          : `${tests.length} tests imported.`}
      </p>
    </div>
  );
}

export default function TestsPage() {
  // Compiled to a constant per build: production 404s, dev shows the banner.
  if (!enabled && process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <section className="bg-surface py-8 sm:py-10">
        <Container>
          <Breadcrumbs items={[crumbs[0], { label: crumbs[1].label }]} />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {pageTitles.tests}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-pretty text-muted">
            {intro}
          </p>
          {!enabled && <DevBanner />}
        </Container>
      </section>

      <Container className="py-8 sm:py-10">
        {tests.length > 0 ? (
          <TestDirectory
            tests={tests}
            services={serviceOptions}
            homeSampling={
              resolvedFeatures.homeSampling &&
              tests.some((test) => test.homeSampling)
            }
            whatsappNumber={contact.whatsapp.number}
            bookTemplate={testBookingTemplate}
            askTemplate={searchQuestionMessage(QUERY_TOKEN)}
          />
        ) : (
          <div className="rounded-card bg-surface p-8 text-center">
            <FlaskConical
              aria-hidden="true"
              className="mx-auto size-8 text-brand-blue"
            />
            <p className="mt-3 text-lg font-bold text-navy">
              No tests have been imported yet
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
