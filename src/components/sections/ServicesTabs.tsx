"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  startTransition,
  useId,
  useRef,
  useState,
  ViewTransition,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/cn";
import { serviceIcon } from "@/lib/service-icons";

export type ServiceCardData = {
  slug: string;
  name: string;
  summary: string;
  icon: string;
  href: string;
};

export type ServiceTab = {
  id: string;
  label: string;
  /** Slugs into the `services` list, so each service is serialised once. */
  slugs: string[];
};

/**
 * Category tabs over one grid of service cards. The first tab ("All") is
 * selected by default, so every service is in the prerendered HTML.
 *
 * Switching tabs runs inside a React transition with each card wrapped in a
 * <ViewTransition>: the browser's View Transitions API animates cards that
 * stay to their new grid position and fades the rest in or out. No animation
 * library ships to the client, and browsers without support simply swap.
 * Reduced motion is honoured in globals.css.
 *
 * Tabs follow the WAI-ARIA pattern (roving tabindex, arrows/Home/End).
 */
export function ServicesTabs({
  services,
  tabs,
}: {
  services: ServiceCardData[];
  tabs: ServiceTab[];
}) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const activeServices = active
    ? active.slugs.flatMap((slug) => services.filter((s) => s.slug === slug))
    : [];
  const panelId = `${baseId}-panel`;

  function select(id: string) {
    startTransition(() => setActiveId(id));
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    const nextTab = tabs[next];
    select(nextTab.id);
    tabRefs.current.get(nextTab.id)?.focus();
  }

  if (!active) return null;

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Service categories"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === active.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) tabRefs.current.set(tab.id, node);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
                selected
                  ? "border-navy bg-navy text-white"
                  : "border-ink/15 bg-white text-ink hover:border-navy hover:text-navy",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 text-xs",
                  selected ? "bg-white/20" : "bg-surface text-muted",
                )}
              >
                {tab.slugs.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${baseId}-tab-${active.id}`}
        className="mt-6"
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {activeServices.map((service) => {
            const Icon = serviceIcon(service.icon);
            return (
              <ViewTransition key={service.slug} name={`svc-${service.slug}`}>
                {/* Phones: compact rows, icon left. From sm: tall cards. */}
                <li className="group relative flex gap-4 rounded-card bg-white p-4 shadow-card ring-1 ring-ink/5 motion-safe:transition-shadow motion-safe:hover:shadow-card-hover sm:flex-col sm:gap-0 sm:p-6">
                  {Icon && (
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tint text-brand-blue sm:size-12">
                      <Icon aria-hidden="true" className="size-5 sm:size-6" />
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="font-bold text-navy sm:mt-4 sm:text-lg">
                      {/* Stretched link: the whole card is the click target. */}
                      <Link
                        href={service.href}
                        className="rounded-sm after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-blue"
                      >
                        {service.name}
                      </Link>
                    </h3>
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
              </ViewTransition>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
