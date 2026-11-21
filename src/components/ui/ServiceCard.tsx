import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { serviceIcon } from "@/lib/service-icons";
import { ServiceIcon } from "./ServiceIcon";

/** The serialisable shape a card needs; safe to pass to client components. */
export type ServiceCardData = {
  slug: string;
  name: string;
  summary: string;
  icon: string;
  href: string;
};

type ServiceCardProps = {
  service: ServiceCardData;
  /** Match the page outline: h2 directly under a page H1, h3 under a section h2. */
  headingLevel?: "h2" | "h3";
  className?: string;
};

/**
 * One service: icon, name, two-line summary, "Learn more". The name is a
 * stretched link, so the whole card is the click target while screen readers
 * hear a single link named after the service.
 *
 * Phones get a compact row (icon left); from sm it is a tall card. No hooks,
 * so it renders in server pages and inside client islands alike. Returns an
 * <li>: render it inside a <ul>.
 */
export function ServiceCard({
  service,
  headingLevel: Heading = "h3",
  className,
}: ServiceCardProps) {
  return (
    <li
      className={cn(
        "group relative flex gap-4 rounded-card bg-white p-4 shadow-card ring-1 ring-ink/5 motion-safe:transition-shadow motion-safe:hover:shadow-card-hover sm:flex-col sm:gap-0 sm:p-6",
        className,
      )}
    >
      {serviceIcon(service.icon) && (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tint text-brand-blue sm:size-12">
          <ServiceIcon name={service.icon} className="size-5 sm:size-6" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Heading className="font-bold text-balance text-navy sm:mt-4 sm:text-lg">
          <Link
            href={service.href}
            className="rounded-sm after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-blue"
          >
            {service.name}
          </Link>
        </Heading>
        <p className="mt-1 line-clamp-2 text-sm text-muted sm:mt-2">
          {service.summary}
        </p>
        <span
          aria-hidden="true"
          className="mt-auto hidden items-center gap-1.5 pt-4 text-sm font-semibold text-brand-blue sm:flex"
        >
          Learn more
          <ArrowRight className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
        </span>
      </div>
    </li>
  );
}
