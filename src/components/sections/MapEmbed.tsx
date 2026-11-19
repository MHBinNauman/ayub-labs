"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import { useIsDesktop } from "@/lib/use-media-query";

type MapEmbedProps = {
  src: string;
  /** Accessible name for the iframe, e.g. "Map of Saddar, Rawalpindi". */
  title: string;
  /** Shown on the poster, e.g. the branch name. */
  label: string;
  /**
   * "auto": poster on phones, lazy iframe straight away from lg.
   * "on-request": always the poster until tapped. Use it where the map sits
   * in a container hidden at some sizes, so a hidden iframe never loads.
   */
  mode?: "auto" | "on-request";
};

/**
 * Google Maps iframe. A map costs hundreds of kilobytes, so on phones it sits
 * behind a "Show map" poster until asked for. (A display:none iframe is not
 * reliably lazy-loaded, so the iframe is not in the DOM at all until wanted.)
 */
export function MapEmbed({ src, title, label, mode = "auto" }: MapEmbedProps) {
  const desktop = useIsDesktop();
  const [requested, setRequested] = useState(false);

  if (requested || (mode === "auto" && desktop)) {
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
