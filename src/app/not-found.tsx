import { MapPin, MessageCircle, Phone, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { contact } from "@/data/site-data";
import { tel, whatsapp } from "@/lib/links";
import { routes, serviceHref } from "@/lib/nav";
import { primaryPhone, servicesByCategory, whatsappGreeting } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * 404. No client JS: the search is a plain GET form that lands on the
 * /services search (?q=), which works with or without JavaScript.
 */
export default function NotFound() {
  return (
    <>
      <section className="bg-surface py-14 lg:py-20">
        <Container>
          <p className="text-sm font-semibold tracking-wide text-brand-red-text uppercase">
            Error 404
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance text-navy sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-pretty text-muted">
            The page you were looking for has moved or no longer exists. Search
            our services, or find a branch near you.
          </p>

          <form
            action={routes.services}
            method="get"
            role="search"
            className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative grow">
              <label htmlFor="not-found-search" className="sr-only">
                Search services
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
              />
              <input
                id="not-found-search"
                type="search"
                name="q"
                placeholder="Search services, e.g. blood test, ultrasound"
                autoComplete="off"
                enterKeyHint="search"
                className="min-h-12 w-full rounded-full border border-ink/20 bg-white pr-4 pl-12 text-base text-ink shadow-card placeholder:text-muted hover:border-ink/40 focus-visible:border-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              />
            </div>
            <Button type="submit" className="rounded-full">
              Search
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={routes.locations} variant="secondary">
              <MapPin aria-hidden="true" className="size-5" />
              Find a branch
            </Button>
            <Button href={routes.contact} variant="secondary">
              Contact us
            </Button>
          </div>
        </Container>
      </section>

      <Container className="py-14 lg:py-20">
        <h2 className="text-2xl font-bold text-navy">Our services</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {servicesByCategory.map((group) => (
            <section
              key={group.category}
              aria-labelledby={`nf-${group.category}`}
            >
              <h3
                id={`nf-${group.category}`}
                className="text-sm font-bold tracking-wider text-muted uppercase"
              >
                {group.label}
              </h3>
              <ul className="mt-2">
                {group.services.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={serviceHref(service.slug)}
                      className="inline-flex min-h-11 min-w-11 items-center font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-blue"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-ink/10 pt-8">
          <Button href={tel(primaryPhone.e164)}>
            <Phone aria-hidden="true" className="size-5" />
            Call {primaryPhone.display}
          </Button>
          <Button
            href={whatsapp(contact.whatsapp.number, whatsappGreeting)}
            target="_blank"
            variant="whatsapp"
          >
            <MessageCircle aria-hidden="true" className="size-5" />
            WhatsApp us
          </Button>
        </div>
      </Container>
    </>
  );
}
