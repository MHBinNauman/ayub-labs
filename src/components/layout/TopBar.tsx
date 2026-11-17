import { Clock, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-data";
import { cn } from "@/lib/cn";
import { formatWeekHours } from "@/lib/hours";
import { tel, whatsapp } from "@/lib/links";
import { routes } from "@/lib/nav";
import { primaryBranch, primaryPhone, whatsappGreeting } from "@/lib/site";

const linkClass =
  "inline-flex h-full items-center gap-1.5 rounded-sm font-semibold transition-colors hover:text-navy focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue";

/**
 * Thin white utility bar above the header band. Below md it is a compact
 * version: phone and the days the branch is open (plus a WhatsApp icon from
 * sm; on phones the floating WhatsApp button covers it).
 *
 * Its height is part of the sticky-header offset in Header.tsx (h-11, lg:h-10).
 */
export function TopBar() {
  const hours = formatWeekHours(primaryBranch);

  return (
    <div className="bg-white text-xs text-muted sm:text-[0.8125rem]">
      <Container className="flex h-11 items-center justify-between gap-4 lg:h-10">
        <div className="flex h-full min-w-0 items-center gap-x-3 md:gap-x-4">
          <a
            href={tel(primaryPhone.e164)}
            className={cn(linkClass, "shrink-0 whitespace-nowrap")}
          >
            <Phone aria-hidden="true" className="size-3.5 text-brand-blue" />
            <span className="sr-only">Call </span>
            {primaryPhone.display}
          </a>
          <a
            href={whatsapp(contact.whatsapp.number, whatsappGreeting)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(linkClass, "hidden px-1 sm:inline-flex")}
          >
            <MessageCircle
              aria-hidden="true"
              className="size-4 text-brand-blue"
            />
            <span className="sr-only md:not-sr-only">WhatsApp</span>
          </a>
          <p className="flex min-w-0 items-center gap-1.5">
            <Clock
              aria-hidden="true"
              className="hidden size-3.5 shrink-0 text-brand-blue md:block"
            />
            <span className="sr-only">Opening hours: </span>
            <span className="truncate">
              {hours.map((row, index) => (
                // Compact bar: only the days the branch is open.
                <span
                  key={row.days}
                  className={row.closed ? "hidden md:inline" : undefined}
                >
                  {index > 0 && (
                    <span aria-hidden="true" className="mx-1.5">
                      ·
                    </span>
                  )}
                  {row.label}
                </span>
              ))}
            </span>
          </p>
        </div>

        <nav
          aria-label="Patient shortcuts"
          className="hidden h-full items-center gap-5 md:flex"
        >
          <Link href={routes.reports} className={linkClass}>
            Get your report
          </Link>
          <Link href={routes.locations} className={linkClass}>
            Find a branch
          </Link>
        </nav>
      </Container>
    </div>
  );
}
