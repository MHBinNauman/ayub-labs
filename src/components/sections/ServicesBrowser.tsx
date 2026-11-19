"use client";

import { MessageCircle, Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CategoryTabs, categoryTabId } from "@/components/ui/CategoryTabs";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { whatsapp } from "@/lib/links";
import { fillTemplate } from "@/lib/message-template";
import type { SearchableService } from "@/lib/service-search";
import { useHydrated } from "@/lib/use-hydrated";
import { setUrlParams, useUrlParams } from "@/lib/use-url-params";

type SearchModule = typeof import("@/lib/service-search");

export type CategoryOption = { id: string; label: string };

type ServicesBrowserProps = {
  services: SearchableService[];
  categories: CategoryOption[];
  /** WhatsApp number (digits) for the empty-state "Ask us" button. */
  whatsappNumber: string;
  /** Pre-filled message containing QUERY_TOKEN, built on the server from site data. */
  askTemplate: string;
};

const ALL = "all";

/** Plain substring match, used for the instant while fuse.js loads. */
function quickFilter(services: SearchableService[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return services;
  return services.filter((service) =>
    [service.name, service.legacyName, service.summary, service.categoryLabel]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

/**
 * /services: search box, category tabs and the results grid, all synced to
 * the URL (?category=&q=) so a filtered view can be shared or bookmarked.
 * The prerendered HTML is the unfiltered list, so every service is in it.
 */
export function ServicesBrowser({
  services,
  categories,
  whatsappNumber,
  askTemplate,
}: ServicesBrowserProps) {
  const baseId = useId();
  const params = useUrlParams();
  // Exposed as data-hydrated so tests can wait for interactivity.
  const hydrated = useHydrated();
  const query = params.get("q") ?? "";
  const urlCategory = params.get("category");
  const category = categories.some((option) => option.id === urlCategory)
    ? urlCategory
    : null;

  // fuse.js is fetched only once there is something to search for.
  const [searchModule, setSearchModule] = useState<SearchModule | null>(null);
  const needsSearch = query.trim() !== "" && searchModule === null;
  useEffect(() => {
    if (!needsSearch) return;
    let cancelled = false;
    import("@/lib/service-search").then((module) => {
      if (!cancelled) setSearchModule(module);
    });
    return () => {
      cancelled = true;
    };
  }, [needsSearch]);

  // Matches for the query across every category; each tab shows its share.
  const matches = !query.trim()
    ? services
    : searchModule
      ? searchModule.filterServices(services, { category: null, q: query })
      : quickFilter(services, query);
  const visible = category
    ? matches.filter((service) => service.category === category)
    : matches;

  const tabs = [
    { id: ALL, label: "All", count: matches.length },
    ...categories.map((option) => ({
      id: option.id,
      label: option.label,
      count: matches.filter((service) => service.category === option.id).length,
    })),
  ];
  const activeTab = category ?? ALL;
  const panelId = `${baseId}-results`;
  const inputId = `${baseId}-search`;
  const trimmed = query.trim();

  return (
    <div data-hydrated={hydrated || undefined}>
      <div className="relative max-w-xl">
        <label htmlFor={inputId} className="sr-only">
          Search services
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          // Typing replaces the history entry, so Back is not one step per key.
          onChange={(event) =>
            setUrlParams({ q: event.target.value }, { push: false })
          }
          placeholder="Search services, e.g. blood test, ultrasound"
          autoComplete="off"
          enterKeyHint="search"
          className="min-h-12 w-full rounded-full border border-ink/20 bg-white pr-12 pl-12 text-base text-ink shadow-card placeholder:text-muted focus-visible:border-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setUrlParams({ q: null }, { push: false })}
            className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-navy focus-visible:outline-2 focus-visible:outline-brand-blue"
          >
            <X aria-hidden="true" className="size-5" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>

      <CategoryTabs
        tabs={tabs}
        activeId={activeTab}
        // A new history entry, so Back returns to the previous category.
        onSelect={(id) =>
          setUrlParams({ category: id === ALL ? null : id }, { push: true })
        }
        label="Service categories"
        idPrefix={baseId}
        controlsId={panelId}
        className="mt-6"
      />

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={categoryTabId(baseId, activeTab)}
        className="mt-6"
      >
        <p role="status" className="mb-4 text-sm text-muted">
          {visible.length === 1 ? "1 service" : `${visible.length} services`}
          {trimmed && ` matching “${trimmed}”`}
        </p>

        {visible.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {visible.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                headingLevel="h2"
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-card bg-surface p-8 text-center">
            <p className="text-lg font-bold text-navy">
              No services match “{trimmed}”
            </p>
            <p className="mt-2 text-muted">
              We may still offer it. Send us a message and we&apos;ll tell you.
            </p>
            <Button
              href={whatsapp(whatsappNumber, fillTemplate(askTemplate, query))}
              target="_blank"
              variant="whatsapp"
              className="mt-5"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              Can&apos;t find it? Ask us
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
