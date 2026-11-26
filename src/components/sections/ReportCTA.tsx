import { ExternalLink, FileText, MessageCircle } from "lucide-react";
import { Button, Container } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { contact, features } from "@/data/site-data";
import { whatsapp } from "@/lib/links";
import { reportRequestMessage, reportSteps } from "@/lib/site";

/**
 * "Access your reports": a navy→logo-blue band, then the three steps from
 * sample to report, revealed one after another. With a report portal
 * (features.reportPortalUrl) the band links there; until one exists it offers
 * a WhatsApp request instead, and the last step says so.
 */
export function ReportCTA({
  steps = reportSteps,
}: {
  /** Defaults to the derived steps; tests pass their own. */
  steps?: readonly string[];
}) {
  const portal = features.reportPortalUrl;

  return (
    <section aria-labelledby="report-heading" className="py-16 sm:py-24">
      <Container>
        {/* The band, then each step in turn. */}
        <Reveal stagger={0.15}>
          <div className="flex flex-col gap-6 rounded-card bg-linear-110 from-navy to-brand-blue p-6 text-white shadow-card sm:p-8 md:flex-row md:items-center md:justify-between lg:p-12">
            <div className="flex gap-5">
              <span className="hidden size-14 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 sm:grid">
                <FileText aria-hidden="true" className="size-7" />
              </span>
              <div>
                <h2
                  id="report-heading"
                  className="text-2xl font-bold text-balance sm:text-3xl lg:text-4xl"
                >
                  Access your reports
                </h2>
                <p className="mt-2 max-w-xl text-white/90">
                  {portal
                    ? "View and download your report online, any time."
                    : "Ask for your report on WhatsApp and our team will help you get it."}
                </p>
              </div>
            </div>
            {portal ? (
              <Button
                href={portal}
                target="_blank"
                variant="inverse"
                size="lg"
                className="shrink-0"
              >
                View your report
                <ExternalLink aria-hidden="true" className="size-5" />
              </Button>
            ) : (
              <Button
                href={whatsapp(contact.whatsapp.number, reportRequestMessage)}
                target="_blank"
                variant="whatsapp"
                size="lg"
                // Brand-blue focus ring is barely visible on navy.
                className="shrink-0 focus-visible:outline-white"
              >
                <MessageCircle aria-hidden="true" className="size-5" />
                Request on WhatsApp
              </Button>
            )}
          </div>

          {steps.length > 0 && (
            <div className="relative mt-8">
              {/* Connector behind the step numbers, md and up. */}
              <span
                aria-hidden="true"
                className="absolute top-12 right-[16.66%] left-[16.66%] hidden h-0.5 bg-tint md:block"
              />
              <ol
                aria-label="How to get your report"
                className="relative grid gap-4 md:grid-cols-3 md:gap-6"
              >
                {steps.map((step, index) => (
                  <li key={step} data-reveal className="relative">
                    <div className="flex h-full items-center gap-4 rounded-card bg-white p-5 shadow-card ring-1 ring-ink/5 md:flex-col md:p-6 md:text-center">
                      <span
                        aria-hidden="true"
                        className="grid size-12 shrink-0 place-items-center rounded-full bg-navy text-lg font-bold text-white ring-4 ring-white"
                      >
                        {index + 1}
                      </span>
                      <span className="font-semibold text-balance text-navy">
                        {step}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
