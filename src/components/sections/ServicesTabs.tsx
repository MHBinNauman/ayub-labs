"use client";

import { startTransition, useId, useState, ViewTransition } from "react";
import { CategoryTabs, categoryTabId } from "@/components/ui/CategoryTabs";
import {
  ServicePhotoCard,
  type ServicePhotoCardData,
} from "@/components/ui/ServicePhotoCard";

export type ServiceTab = {
  id: string;
  label: string;
  /** Slugs into the `services` list, so each service is serialised once. */
  slugs: string[];
};

/**
 * Homepage: category tabs over one grid of service cards. The first tab
 * ("All") is selected by default, so every service is in the prerendered HTML.
 *
 * Switching tabs runs inside a React transition with each card wrapped in a
 * <ViewTransition>: the browser's View Transitions API animates cards that
 * stay to their new grid position and fades the rest in or out (timing in
 * globals.css, `.svc-card`). No animation library ships to the client, and
 * browsers without support simply swap. Reduced motion is honoured in
 * globals.css.
 *
 * On phones the tab row scrolls sideways; its right edge fades out to show
 * there is more, with end padding so the last tab can scroll clear of it.
 */
export function ServicesTabs({
  services,
  tabs,
}: {
  services: ServicePhotoCardData[];
  tabs: ServiceTab[];
}) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  if (!active) return null;

  const activeServices = active.slugs.flatMap((slug) =>
    services.filter((service) => service.slug === slug),
  );
  const panelId = `${baseId}-panel`;

  return (
    <div className="mt-8">
      <CategoryTabs
        tabs={tabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          count: tab.slugs.length,
        }))}
        activeId={active.id}
        onSelect={(id) => startTransition(() => setActiveId(id))}
        label="Service categories"
        idPrefix={baseId}
        controlsId={panelId}
      />

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={categoryTabId(baseId, active.id)}
        className="mt-6"
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {activeServices.map((service) => (
            <ViewTransition
              key={service.slug}
              name={`svc-${service.slug}`}
              default="svc-card"
            >
              <ServicePhotoCard service={service} headingLevel="h3" />
            </ViewTransition>
          ))}
        </ul>
      </div>
    </div>
  );
}
