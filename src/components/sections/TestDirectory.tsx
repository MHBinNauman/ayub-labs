"use client";

import { MessageCircle, Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { controlClass } from "@/components/ui/Field";
import { formatPKR } from "@/lib/format-price";
import { whatsapp } from "@/lib/links";
import { fillTemplate } from "@/lib/message-template";
import {
  effectiveSort,
  isTestSort,
  runFilter,
  TEST_SORTS,
  type DirectoryTest,
  type FastingFilter,
  type TestFilter,
} from "@/lib/test-filter";
import { useHydrated } from "@/lib/use-hydrated";
import { setUrlParams, useUrlParams } from "@/lib/use-url-params";

type SearchModule = typeof import("@/lib/test-search");

export type ServiceOption = { slug: string; name: string };

export type TestDirectoryProps = {
  tests: DirectoryTest[];
  /** Services that have at least one test, in data order. */
  services: ServiceOption[];
  /** features.homeSampling: show the home-sampling filter and chips. */
  homeSampling: boolean;
  /** WhatsApp number (digits) for booking and for "Ask us". */
  whatsappNumber: string;
  /** Booking message containing QUERY_TOKEN, built on the server. */
  bookTemplate: string;
  /** Message for an empty search, containing QUERY_TOKEN. */
  askTemplate: string;
};

const FASTING_OPTIONS: { id: FastingFilter; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "yes", label: "Fasting needed" },
  { id: "no", label: "No fasting needed" },
];

const chip =
  "inline-flex items-center rounded-md bg-surface px-2 py-0.5 text-xs font-semibold text-ink";

/** Reads the filter from the URL (?q=&service=&fasting=&home=&sort=). */
function readFilter(
  params: URLSearchParams,
  services: ServiceOption[],
  homeSampling: boolean,
): TestFilter {
  const service = params.get("service");
  const fasting = params.get("fasting");
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    service: services.some((option) => option.slug === service)
      ? service
      : null,
    fasting: fasting === "yes" || fasting === "no" ? fasting : "any",
    home: homeSampling && params.get("home") === "1",
    sort: isTestSort(sort) ? sort : "relevance",
  };
}

function TestRow({
  test,
  homeSampling,
  bookHref,
}: {
  test: DirectoryTest;
  homeSampling: boolean;
  bookHref: string;
}) {
  const chips = [
    test.sample,
    test.fasting === true && "Fasting needed",
    test.fasting === false && "No fasting needed",
    test.turnaround && `Results: ${test.turnaround}`,
    homeSampling && test.homeSampling && "Home sampling",
  ].filter((value): value is string => Boolean(value));

  return (
    <li className="flex flex-col gap-4 rounded-card bg-white p-5 shadow-card ring-1 ring-ink/5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-balance text-navy">
          {test.name}
        </h2>
        {test.aka && test.aka.length > 0 && (
          <p className="text-sm text-muted">
            Also called {test.aka.join(", ")}
          </p>
        )}
        <p className="mt-1 text-sm text-muted">
          {test.serviceName}
          {test.code && (
            <>
              <span aria-hidden="true"> · </span>
              <span className="sr-only">, </span>
              Code {test.code}
            </>
          )}
        </p>
        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Details">
            {chips.map((text) => (
              <li key={text} className={chip}>
                {text}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
        {test.pricePKR !== undefined && (
          <p className="text-xl font-bold whitespace-nowrap text-navy tabular-nums">
            <span className="sr-only">Price: </span>
            {formatPKR(test.pricePKR)}
          </p>
        )}
        <Button
          href={bookHref}
          target="_blank"
          variant="whatsapp"
          size="sm"
          className="ml-auto sm:ml-0"
        >
          <MessageCircle aria-hidden="true" className="size-4" />
          Book via WhatsApp
          <span className="sr-only">: {test.name}</span>
        </Button>
      </div>
    </li>
  );
}

/**
 * /tests: fuzzy search, filters and sort over every test, synced to the URL
 * so a view can be shared. The prerendered HTML is the full, name-sorted
 * list, so every test is in it without JavaScript.
 */
export function TestDirectory({
  tests,
  services,
  homeSampling,
  whatsappNumber,
  bookTemplate,
  askTemplate,
}: TestDirectoryProps) {
  const baseId = useId();
  const hydrated = useHydrated();
  const params = useUrlParams();
  const filter = readFilter(params, services, homeSampling);
  const query = filter.q.trim();

  // fuse.js is fetched only once there is something to search for.
  const [searchModule, setSearchModule] = useState<SearchModule | null>(null);
  const needsSearch = query !== "" && searchModule === null;
  useEffect(() => {
    if (!needsSearch) return;
    let cancelled = false;
    import("@/lib/test-search").then((module) => {
      if (!cancelled) setSearchModule(module);
    });
    return () => {
      cancelled = true;
    };
  }, [needsSearch]);

  const visible = searchModule
    ? searchModule.filterTests(tests, filter)
    : runFilter(tests, filter);
  const sort = effectiveSort(filter.sort, filter.q);
  const sortOptions = TEST_SORTS.filter(
    (option) => option.id !== "relevance" || query,
  );
  const filtered =
    query !== "" ||
    filter.service !== null ||
    filter.fasting !== "any" ||
    filter.home;

  const ids = {
    search: `${baseId}-search`,
    service: `${baseId}-service`,
    fasting: `${baseId}-fasting`,
    home: `${baseId}-home`,
    sort: `${baseId}-sort`,
  };
  const labelClass = "mb-1 block text-sm font-semibold text-ink";
  // Choosing a filter adds a history entry, so Back undoes it.
  const set = (updates: Record<string, string | null>) =>
    setUrlParams(updates, { push: true });

  return (
    <div data-hydrated={hydrated || undefined}>
      {/* Sticky under the header on phones, so search is always in reach. */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-ink/10 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-b-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="relative max-w-xl">
          <label htmlFor={ids.search} className="sr-only">
            Search tests
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
          />
          <input
            id={ids.search}
            type="search"
            value={filter.q}
            // Typing replaces the history entry, so Back is not one step per key.
            onChange={(event) =>
              setUrlParams({ q: event.target.value }, { push: false })
            }
            placeholder="Search by test name or code"
            autoComplete="off"
            enterKeyHint="search"
            className="min-h-12 w-full rounded-full border border-ink/20 bg-white pr-12 pl-12 text-base text-ink shadow-card placeholder:text-muted hover:border-ink/40 focus-visible:border-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue [&::-webkit-search-cancel-button]:hidden"
          />
          {filter.q && (
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
      </div>

      <div
        role="group"
        aria-label="Filter and sort tests"
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        {services.length > 1 && (
          <div>
            <label htmlFor={ids.service} className={labelClass}>
              Category
            </label>
            <select
              id={ids.service}
              value={filter.service ?? ""}
              onChange={(event) => set({ service: event.target.value || null })}
              className={controlClass(false)}
            >
              <option value="">All categories</option>
              {services.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor={ids.fasting} className={labelClass}>
            Fasting
          </label>
          <select
            id={ids.fasting}
            value={filter.fasting}
            onChange={(event) =>
              set({
                fasting:
                  event.target.value === "any" ? null : event.target.value,
              })
            }
            className={controlClass(false)}
          >
            {FASTING_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.sort} className={labelClass}>
            Sort by
          </label>
          <select
            id={ids.sort}
            value={sort}
            onChange={(event) =>
              set({
                sort:
                  event.target.value === "relevance"
                    ? null
                    : event.target.value,
              })
            }
            className={controlClass(false)}
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {homeSampling && (
          <label
            htmlFor={ids.home}
            className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-semibold text-ink"
          >
            <input
              id={ids.home}
              type="checkbox"
              checked={filter.home}
              onChange={(event) =>
                set({ home: event.target.checked ? "1" : null })
              }
              className="size-5 accent-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            />
            Home sampling available
          </label>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm text-muted">
          {visible.length === 1 ? "1 test" : `${visible.length} tests`}
          {query && ` matching “${query}”`}
        </p>
        {filtered && (
          <button
            type="button"
            onClick={() =>
              set({
                q: null,
                service: null,
                fasting: null,
                home: null,
                sort: null,
              })
            }
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-navy underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-blue"
          >
            Clear all filters
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {visible.map((test) => (
            <TestRow
              key={test.id}
              test={test}
              homeSampling={homeSampling}
              bookHref={whatsapp(
                whatsappNumber,
                fillTemplate(bookTemplate, test.name),
              )}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-card bg-surface p-8 text-center">
          <p className="text-lg font-bold text-navy">
            {query
              ? `No tests match “${query}”`
              : "No tests match these filters"}
          </p>
          <p className="mt-2 text-muted">
            We may still offer it. Send us a message and we&apos;ll tell you.
          </p>
          <Button
            href={
              query
                ? whatsapp(whatsappNumber, fillTemplate(askTemplate, query))
                : whatsapp(whatsappNumber)
            }
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
  );
}
