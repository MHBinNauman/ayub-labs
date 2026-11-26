import {
  ArrowRight,
  FileText,
  MapPin,
  MessageCircle,
  Microscope,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { branches, contact, features, services } from "@/data/site-data";
import { whatsapp } from "@/lib/links";
import { routes } from "@/lib/nav";
import { cities, joinList, whatsappGreeting } from "@/lib/site";

type Action = {
  title: string;
  line: string;
  href: string;
  Icon: LucideIcon;
  external?: boolean;
};

const actions: Action[] = [
  {
    title: "Find a branch",
    line: `${branches.length} branches in ${joinList(cities, "&")}`,
    href: routes.locations,
    Icon: MapPin,
  },
  {
    title: "Get your report",
    line: features.reportPortalUrl
      ? "View your results online"
      : "Ask for your results on WhatsApp",
    href: routes.reports,
    Icon: FileText,
  },
  {
    title: "Our services",
    line: `${services.length} services, from lab tests to clinics`,
    href: routes.services,
    Icon: Microscope,
  },
  {
    title: "Talk to us",
    line: "Chat with us on WhatsApp",
    href: whatsapp(contact.whatsapp.number, whatsappGreeting),
    Icon: MessageCircle,
    external: true,
  },
];

/**
 * Four shortcut cards that overlap the bottom of the hero by 3rem. They rise
 * in 60ms apart when they start below the fold (Reveal leaves cards that are
 * already on screen alone). On hover or focus the icon tile fills with brand
 * blue: a scaled layer, so only transform animates.
 */
export function QuickActions() {
  return (
    <section aria-label="Quick actions" className="relative z-10 -mt-12">
      <Container>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {actions.map(({ title, line, href, Icon, external }, index) => {
            const className =
              // Phones: 2×2 tiles with the icon on top. sm–lg: rows. lg: four columns.
              "group flex h-full flex-col items-start gap-3 rounded-card bg-white p-4 shadow-card-hover ring-1 ring-ink/5 transition-shadow hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-col lg:items-start lg:p-6";
            const content = (
              <>
                <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-tint text-brand-blue sm:size-12">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 scale-0 rounded-[inherit] bg-brand-blue group-hover:scale-100 group-focus-visible:scale-100 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  <Icon
                    aria-hidden="true"
                    className="relative size-5 group-hover:text-white group-focus-visible:text-white motion-safe:transition-colors motion-safe:duration-300 sm:size-6"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-bold text-navy">
                    {title}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 text-brand-red motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                    />
                  </span>
                  <span className="mt-0.5 block text-xs text-muted sm:text-sm">
                    {line}
                  </span>
                </span>
              </>
            );
            return (
              <li key={title}>
                <Reveal delay={index * 0.06} className="h-full">
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link href={href} className={className}>
                      {content}
                    </Link>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
