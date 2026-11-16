/** URL builders. Pass values from site-data.ts; never hard-code them. */

/** `tel:` link from an E.164 number, e.g. "+92518448533". */
export function tel(e164: string): string {
  return `tel:${e164}`;
}

/** WhatsApp chat link. `number` is E.164, with or without the "+". */
export function whatsapp(number: string, message?: string): string {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Keyless Google Maps embed URL for an iframe `src`. */
export function mapsEmbed(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

/** Google Maps directions to a place, from the visitor's current location. */
export function mapsDirections(query: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function mailto(email: string, subject?: string): string {
  const base = `mailto:${email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
