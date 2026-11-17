import { MessageCircle } from "lucide-react";
import { contact } from "@/data/site-data";
import { whatsapp } from "@/lib/links";
import { whatsappGreeting } from "@/lib/site";

const LABEL = "Chat on WhatsApp";

/**
 * Fixed 56px WhatsApp button, bottom-right. Sits higher below lg (bottom-20)
 * to stay clear of the action bar at the foot of the mobile menu. CSS-only
 * tooltip; no popup ever opens by itself. No client JavaScript.
 */
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsapp(contact.whatsapp.number, whatsappGreeting)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={LABEL}
      className="group fixed right-4 bottom-20 z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-ink shadow-card-hover transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue motion-safe:hover:scale-105 sm:right-6 lg:bottom-6"
    >
      <MessageCircle aria-hidden="true" className="size-7" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full mr-3 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-white opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {LABEL}
      </span>
    </a>
  );
}
