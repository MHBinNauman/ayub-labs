"use client";

import { MapPin } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

/** Tailwind's lg breakpoint. */
const DESKTOP_QUERY = "(min-width: 64rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;
const isDesktopOnServer = () => false;

type MapEmbedProps = {
  src: string;
  /** Accessible name for the iframe, e.g. "Map of Saddar, Rawalpindi". */
  title: string;
  /** Shown on the poster, e.g. the branch area. */
  label: string;
};

/**
 * Google Maps iframe. A map costs hundreds of kilobytes, so on phones it sits
 * behind a "Show map" poster until asked for; from lg it renders straight
 * away with loading="lazy". (A display:none iframe is not reliably
 * lazy-loaded, so the iframe is not in the DOM at all until it is wanted.)
 */
export function MapEmbed({ src, title, label }: MapEmbedProps) {
  const desktop = useSyncExternalStore(subscribe, isDesktop, isDesktopOnServer);
  const [requested, setRequested] = useState(false);

  if (desktop || requested) {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="size-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRequested(true)}
      className="group flex size-full flex-col items-center justify-center gap-3 bg-tint text-navy focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-blue"
    >
      <span className="grid size-12 place-items-center rounded-full bg-white text-brand-red shadow-card">
        <MapPin aria-hidden="true" className="size-6" />
      </span>
      <span className="font-semibold">{label}</span>
      <span className="inline-flex min-h-11 items-center rounded-full border-2 border-navy px-4 text-sm font-semibold transition-colors group-hover:bg-navy group-hover:text-white">
        Show map
      </span>
    </button>
  );
}
