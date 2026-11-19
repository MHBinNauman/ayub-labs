import {
  ArrowRight,
  Clock,
  House,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { BranchStatusChip } from "@/components/ui/BranchStatusChip";
import type { Branch } from "@/data/site-data";
import { formatWeekHours } from "@/lib/hours";
import { mapsDirections, mapsEmbed, tel, whatsapp } from "@/lib/links";
import { branchHeadingId } from "@/lib/locations-state";
import { routes } from "@/lib/nav";
import { branchWhatsappMessage, formatPhone } from "@/lib/site";
import { ShowOnMapButton } from "./BranchCardFrame";
import { MapEmbed } from "./MapEmbed";

/** Shown wherever hours are listed for a branch whose hours are not confirmed. */
export const UNVERIFIED_HOURS_NOTE =
  "Hours not yet confirmed. Please call before visiting.";

const rowIcon = "mt-0.5 size-5 shrink-0 text-brand-blue";

/**
 * A branch in the IDC card format (name; address, phone and hours each with
 * an icon) plus live status, Directions / Call / WhatsApp, a desktop "Show on
 * map" button, a tap-to-load map on phones, and a link to the branch page.
 */
export function BranchCard({ branch }: { branch: Branch }) {
  const directions = branch.googleMapsUrl ?? mapsDirections(branch.mapQuery);
  const callNumber = branch.phones[0];
  const hours = formatWeekHours(branch);

  return (
    <article
      aria-labelledby={branchHeadingId(branch.id)}
      className="flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card ring-1 ring-ink/5"
    >
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold tracking-wider text-brand-red-text uppercase">
          {branch.city}
        </p>
        <h2
          id={branchHeadingId(branch.id)}
          // Focus target after "pick a branch" scrolls here.
          tabIndex={-1}
          className="mt-1 text-xl font-bold text-navy focus:outline-none"
        >
          {branch.name}
        </h2>
        <BranchStatusChip
          branch={{ hours: branch.hours, hoursVerified: branch.hoursVerified }}
          className="mt-2 w-fit"
        />

        <ul className="mt-4 space-y-3 text-sm text-ink">
          <li className="flex gap-3">
            <House aria-hidden="true" className={rowIcon} />
            <address className="not-italic">
              <span className="sr-only">Address: </span>
              {branch.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </li>
          <li className="flex gap-3">
            <Phone aria-hidden="true" className={rowIcon} />
            <span className="flex flex-wrap gap-x-4">
              {branch.phones.map((phone) => (
                <a
                  key={phone}
                  href={tel(phone)}
                  className="font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand-blue"
                >
                  <span className="sr-only">Call </span>
                  {formatPhone(phone)}
                </a>
              ))}
            </span>
          </li>
          <li className="flex gap-3">
            <Clock aria-hidden="true" className={rowIcon} />
            <span>
              <span className="sr-only">Opening hours: </span>
              {hours.map((row) => (
                <span key={row.days} className="block">
                  {row.label}
                </span>
              ))}
              {!branch.hoursVerified && (
                <span className="mt-1 block text-xs font-semibold text-brand-red-text">
                  {UNVERIFIED_HOURS_NOTE}
                </span>
              )}
            </span>
          </li>
        </ul>

        {/* Phones: the map lives in the card, loaded only on request. */}
        <div className="mt-5 aspect-video overflow-hidden rounded-lg lg:hidden">
          <MapEmbed
            src={mapsEmbed(branch.mapQuery)}
            title={`Map of ${branch.name}`}
            label={branch.name}
            mode="on-request"
          />
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Button
            href={directions}
            target="_blank"
            size="sm"
            aria-label={`Directions to ${branch.name}`}
          >
            <Navigation aria-hidden="true" className="size-4" />
            Directions
          </Button>
          {callNumber && (
            <Button
              href={tel(callNumber)}
              variant="secondary"
              size="sm"
              aria-label={`Call ${branch.name}`}
            >
              <Phone aria-hidden="true" className="size-4" />
              Call
            </Button>
          )}
          {branch.whatsapp && (
            <Button
              href={whatsapp(branch.whatsapp, branchWhatsappMessage(branch))}
              target="_blank"
              variant="whatsapp"
              size="sm"
              aria-label={`WhatsApp ${branch.name}`}
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              WhatsApp
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-ink/10 px-4 py-1">
        <Link
          href={`${routes.locations}/${branch.id}`}
          className="group inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-brand-blue focus-visible:outline-2 focus-visible:outline-brand-blue"
        >
          Branch details
          <span className="sr-only">: {branch.name}</span>
          <ArrowRight
            aria-hidden="true"
            className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
          />
        </Link>
        <ShowOnMapButton branchId={branch.id} branchName={branch.name} />
      </div>
    </article>
  );
}
