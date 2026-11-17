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

/** Four shortcut cards that overlap the bottom of the hero by 3rem. */
export function QuickActions() {
  return (
    <section aria-label="Quick actions" className="relative z-10 -mt-12">
      <Container>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {actions.map(({ title, line, href, Icon, external }) => {
            const className =
              // Phones: 2×2 tiles with the icon on top. sm–lg: rows. lg: four columns.
              "group flex h-full flex-col items-start gap-3 rounded-card bg-white p-4 shadow-card-hover ring-1 ring-ink/5 transition-shadow hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:flex-col lg:items-start lg:p-6";
            const content = (
              <>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-brand-blue sm:size-12">
                  <Icon aria-hidden="true" className="size-5 sm:size-6" />
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
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
