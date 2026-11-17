import { Section } from "@/components/ui";
import type { stats as statsData } from "@/data/site-data";

/**
 * Real, client-supplied figures only. The page renders this only when
 * resolvedFeatures.statsSection is true, and it renders nothing for an empty
 * list, so it can never show the "0 K" counters of the old site.
 */
export function StatsSection({ stats }: { stats: typeof statsData }) {
  if (stats.length === 0) return null;
  const formatter = new Intl.NumberFormat("en-PK");

  return (
    <Section spacing="md" background="tint" aria-label="Key figures">
      <dl className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <dt className="order-2 mt-1 text-sm font-semibold text-muted">
              {stat.label}
            </dt>
            <dd className="text-3xl font-extrabold text-navy sm:text-4xl">
              {formatter.format(stat.value)}
              {stat.suffix}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
