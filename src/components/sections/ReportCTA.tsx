import { ExternalLink, FileText, MessageCircle } from "lucide-react";
import { Button, Container } from "@/components/ui";
import { contact, features } from "@/data/site-data";
import { whatsapp } from "@/lib/links";
import { reportRequestMessage } from "@/lib/site";

/**
 * "Results ready?" band. With a report portal (features.reportPortalUrl) it
 * links there; until one exists it offers a WhatsApp request instead.
 */
export function ReportCTA() {
  const portal = features.reportPortalUrl;

  return (
    <section aria-labelledby="report-heading" className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-6 rounded-r-card border-l-4 border-brand-red bg-surface p-6 sm:p-8 md:flex-row md:items-center md:justify-between lg:p-10">
          <div className="flex gap-4">
            <span className="hidden size-12 shrink-0 place-items-center rounded-full bg-white text-brand-blue shadow-card sm:grid">
              <FileText aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h2
                id="report-heading"
                className="text-2xl font-bold text-navy sm:text-3xl"
              >
                Results ready?
              </h2>
              <p className="mt-2 max-w-xl text-muted">
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
              className="shrink-0"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              Request on WhatsApp
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}
