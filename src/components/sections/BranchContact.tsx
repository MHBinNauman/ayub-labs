import { Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui";
import { BranchStatusChip } from "@/components/ui/BranchStatusChip";
import type { Branch } from "@/data/site-data";
import { cn } from "@/lib/cn";
import { mapsDirections, tel } from "@/lib/links";
import { formatPhone } from "@/lib/site";

type BranchContactProps = {
  branch: Branch;
  /** Heading level for the branch name, to fit the page outline. */
  headingLevel?: "h2" | "h3";
  /** Smaller type and buttons, for the service-page sidebar. */
  compact?: boolean;
  className?: string;
};

/**
 * A branch's name, live open status, address, phone numbers and the
 * Directions / Call buttons. Shared by the homepage locations cards and the
 * service-page sidebar.
 */
export function BranchContact({
  branch,
  headingLevel: Heading = "h3",
  compact = false,
  className,
}: BranchContactProps) {
  const directions = branch.googleMapsUrl ?? mapsDirections(branch.mapQuery);
  const callNumber = branch.phones[0];
  const buttonSize = compact ? "sm" : "md";

  return (
    <div className={cn("flex flex-col", className)}>
      <Heading
        className={cn("font-bold text-navy", compact ? "text-lg" : "text-xl")}
      >
        {branch.name}
      </Heading>
      {/*
       * Own line, so the chip changing width when it goes live can never
       * re-wrap the heading and shift the layout (CLS). Only the fields it
       * needs cross into the client bundle.
       */}
      <BranchStatusChip
        branch={{ hours: branch.hours, hoursVerified: branch.hoursVerified }}
        className="mt-2 w-fit"
      />
      <address className={cn("mt-3 text-ink not-italic", compact && "text-sm")}>
        {branch.addressLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>
      <ul className="mt-2 flex flex-wrap gap-x-4 text-sm">
        {branch.phones.map((phone) => (
          <li key={phone}>
            <a
              href={tel(phone)}
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-blue"
            >
              <Phone aria-hidden="true" className="size-4 text-brand-blue" />
              <span className="sr-only">Call </span>
              {formatPhone(phone)}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap gap-3 pt-4">
        <Button
          href={directions}
          target="_blank"
          size={buttonSize}
          aria-label={`Directions to ${branch.name}`}
        >
          <Navigation aria-hidden="true" className="size-5" />
          Directions
        </Button>
        {callNumber && (
          <Button
            href={tel(callNumber)}
            variant="secondary"
            size={buttonSize}
            aria-label={`Call ${branch.name}`}
          >
            <Phone aria-hidden="true" className="size-5" />
            Call
          </Button>
        )}
      </div>
    </div>
  );
}
