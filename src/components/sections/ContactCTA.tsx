import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Button, Container } from "@/components/ui";
import { contact } from "@/data/site-data";
import { tel, whatsapp } from "@/lib/links";
import { routes } from "@/lib/nav";
import { primaryPhone, whatsappGreeting } from "@/lib/site";

/** Closing band: call, WhatsApp or find a branch. */
export function ContactCTA({
  title = "Ready when you are",
  text = "Call or WhatsApp us with any question, or visit the branch nearest you.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section aria-labelledby="contact-cta-heading" className="py-14 lg:py-20">
      <Container>
        <div className="flex flex-col gap-6 rounded-card bg-linear-to-br from-navy to-brand-blue p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div>
            <h2
              id="contact-cta-heading"
              className="text-2xl font-bold text-balance sm:text-3xl"
            >
              {title}
            </h2>
            <p className="mt-2 max-w-xl text-white/90">{text}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button href={tel(primaryPhone.e164)} variant="inverse" size="lg">
              <Phone aria-hidden="true" className="size-5" />
              Call {primaryPhone.display}
            </Button>
            <Button
              href={whatsapp(contact.whatsapp.number, whatsappGreeting)}
              target="_blank"
              variant="whatsapp"
              size="lg"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              WhatsApp us
            </Button>
            <Button href={routes.locations} variant="inverse" size="lg">
              <MapPin aria-hidden="true" className="size-5" />
              Find a branch
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
