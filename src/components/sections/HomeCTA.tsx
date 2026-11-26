import { MessageCircle, Phone } from "lucide-react";
import { Button, Container } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { contact } from "@/data/site-data";
import { tel, whatsapp } from "@/lib/links";
import { primaryPhone, whatsappGreeting } from "@/lib/site";

/**
 * Homepage closing band: tint→pale blue with a soft brand-blue glow (the one
 * place CLAUDE.md allows that gradient), and WhatsApp + Call buttons.
 */
export function HomeCTA() {
  const hasWhatsapp = Boolean(contact.whatsapp.number);
  if (!hasWhatsapp && !primaryPhone.e164) return null;

  return (
    <section aria-labelledby="home-cta-heading" className="pb-16 sm:pb-24">
      <Container>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-card bg-linear-to-r from-tint to-pale-blue p-6 ring-1 ring-brand-blue/10 sm:p-8 lg:p-12">
            <div
              aria-hidden="true"
              className="absolute -inset-x-1/4 -top-1/2 -z-10 h-[200%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-blue)_18%,transparent),transparent)]"
            />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2
                  id="home-cta-heading"
                  className="text-2xl font-bold text-balance text-navy sm:text-3xl lg:text-4xl"
                >
                  Have a question about a test?
                </h2>
                <p className="mt-2 max-w-xl text-pretty text-muted">
                  Message us on WhatsApp or call, and our team will help.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                {hasWhatsapp && (
                  <Button
                    href={whatsapp(contact.whatsapp.number, whatsappGreeting)}
                    target="_blank"
                    variant="whatsapp"
                    size="lg"
                  >
                    <MessageCircle aria-hidden="true" className="size-5" />
                    WhatsApp us
                  </Button>
                )}
                {primaryPhone.e164 && (
                  <Button href={tel(primaryPhone.e164)} size="lg">
                    <Phone aria-hidden="true" className="size-5" />
                    Call {primaryPhone.display}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
