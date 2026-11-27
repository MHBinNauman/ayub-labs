import { MessageCircle } from "lucide-react";
import { contact } from "@/data/site-data";
import { whatsapp } from "@/lib/links";
import { whatsappGreeting } from "@/lib/site";

const LABEL = "Chat on WhatsApp";

/**
 * Fixed 56px WhatsApp button, 16px from the bottom-right corner (above the
 * iPhone home indicator; fab-right in globals.css). Hidden while the mobile
 * drawer is open, whose action bar has its own WhatsApp button. The footer
 * ends in a safe zone (pb-fab-zone) so it covers nothing there. CSS-only
 * tooltip; no popup ever opens by itself. No client JavaScript: the one ping
 * per session is CSS keyed off <html data-wa-ping> (lib/wa-ping.ts).
 */
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsapp(contact.whatsapp.number, whatsappGreeting)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={LABEL}
      className="vt-whatsapp group fixed fab-right z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-ink shadow-card-hover transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue motion-safe:hover:scale-105"
    >
      <span
        aria-hidden="true"
        className="wa-ping pointer-events-none absolute inset-0 rounded-full bg-whatsapp"
      />
      <MessageCircle aria-hidden="true" className="relative size-7" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full mr-3 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-white opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {LABEL}
      </span>
    </a>
  );
}
