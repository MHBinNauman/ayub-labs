import { MapPin } from "lucide-react";

/**
 * Sits behind a Google Maps iframe while it loads, so the visitor sees
 * "Loading map…" instead of an empty panel. The iframe paints over it.
 */
export function MapLoading() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-tint text-sm font-semibold text-navy"
    >
      <span className="grid size-10 place-items-center rounded-full bg-white text-brand-red shadow-card">
        <MapPin className="size-5" />
      </span>
      Loading map…
    </div>
  );
}
