import { MapPin, Navigation, Phone, type LucideIcon } from "lucide-react";
import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { Container } from "@/components/ui";
import {
  brand,
  branches,
  contact,
  navigation,
  services,
} from "@/data/site-data";
import { cn } from "@/lib/cn";
import { mapsDirections, tel } from "@/lib/links";
import { serviceHref } from "@/lib/nav";
import { currentYear, formatPhone, verifiedRegistrations } from "@/lib/site";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon } from "./SocialIcons";

const linkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-sm text-white/80 transition-colors hover:text-white hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

type SocialLink = {
  label: string;
  url: string | null;
  Icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
};

const socialLinks: SocialLink[] = [
  { label: "Facebook", url: contact.social.facebook, Icon: FacebookIcon },
  { label: "Instagram", url: contact.social.instagram, Icon: InstagramIcon },
  {
    label: "Google Business Profile",
    url: contact.social.googleBusiness,
    Icon: MapPin,
  },
];

/** The year in Karachi. Cached so the footer stays in the static shell. */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return currentYear();
}

function FooterColumn({
  id,
  title,
  className,
  children,
}: {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={className}>
      <h2
        id={id}
        className="text-sm font-bold tracking-wider text-white uppercase"
      >
        {title}
      </h2>
      <span
        aria-hidden="true"
        className="mt-2 block h-0.5 w-8 rounded-full bg-brand-red"
      />
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Footer() {
  const social = socialLinks.filter(
    (link): link is SocialLink & { url: string } => link.url !== null,
  );

  return (
    <footer className="bg-navy text-white">
      <Container className="grid gap-x-8 gap-y-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:py-16">
        <div className="md:col-span-2 lg:col-span-3">
          <Logo size="md" className="w-fit" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/80">
            {brand.aboutDraft}
          </p>
        </div>

        <FooterColumn
          id="footer-services"
          title="Services"
          className="lg:col-span-2"
        >
          <ul>
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={serviceHref(service.slug)}
                  className={cn(linkClass, "text-sm")}
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn
          id="footer-quick-links"
          title="Quick links"
          className="lg:col-span-2"
        >
          <ul>
            {navigation.navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={cn(linkClass, "text-sm")}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn
          id="footer-branches"
          title="Branches"
          className="lg:col-span-3"
        >
          <ul className="space-y-6">
            {branches.map((branch) => (
              <li key={branch.id}>
                <h3 className="font-semibold text-white">{branch.name}</h3>
                <address className="mt-1 text-sm leading-relaxed text-white/80 not-italic">
                  {branch.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <ul className="mt-1 text-sm">
                  {branch.phones.map((phone) => (
                    <li key={phone}>
                      <a href={tel(phone)} className={linkClass}>
                        <Phone aria-hidden="true" className="size-4" />
                        <span className="sr-only">Call </span>
                        {formatPhone(phone)}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href={
                        branch.googleMapsUrl ?? mapsDirections(branch.mapQuery)
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      <Navigation aria-hidden="true" className="size-4" />
                      Directions
                      <span className="sr-only"> to {branch.name}</span>
                    </a>
                  </li>
                </ul>
              </li>
            ))}
          </ul>
        </FooterColumn>

        {verifiedRegistrations.length > 0 && (
          <FooterColumn
            id="footer-registrations"
            title="Registrations"
            className="lg:col-span-2"
          >
            <p className="text-sm text-white/80">Registered with</p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {verifiedRegistrations.map((registration) => (
                <li
                  key={registration.id}
                  className="flex w-20 flex-col items-center gap-2 text-center"
                >
                  <span className="relative block size-20 rounded-xl bg-white">
                    <Image
                      src={registration.logo}
                      alt={registration.name}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-xs font-semibold text-white/80"
                  >
                    {registration.short}
                  </span>
                </li>
              ))}
            </ul>
          </FooterColumn>
        )}
      </Container>

      <div className="border-t border-white/15">
        <Container className="flex flex-col gap-4 py-6 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {brand.displayName}
          </p>
          {social.length > 0 && (
            <ul className="flex gap-2">
              {social.map(({ label, url, Icon }) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </div>
    </footer>
  );
}
