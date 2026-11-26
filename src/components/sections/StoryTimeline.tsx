import { Section, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { StoryEntry } from "@/lib/site";

/**
 * "Our story": a vertical timeline built from storyTimeline() in site.ts,
 * i.e. the dated milestones in site-data.ts plus a generated "Today" entry.
 * An ordered list, so screen readers announce it as a sequence. Each
 * milestone is marked data-reveal, so Section reveals them one after another
 * as they scroll in.
 */
export function StoryTimeline({ entries }: { entries: StoryEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <Section spacing="lg" aria-labelledby="story-heading">
      <SectionHeading
        id="story-heading"
        eyebrow="Our story"
        title="How we got here"
      />
      <ol className="relative mt-10 max-w-2xl space-y-10 border-l-2 border-navy/20 pl-8 sm:pl-10">
        {entries.map((entry) => (
          <li
            key={`${entry.when}-${entry.title}`}
            data-reveal
            className="relative"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1.5 -left-[2.5625rem] size-4 rounded-full ring-4 ring-white sm:-left-[3.0625rem]",
                entry.current ? "bg-brand-red" : "bg-brand-blue",
              )}
            />
            <p className="text-sm font-bold tracking-wide text-brand-blue uppercase">
              {entry.when}
            </p>
            <h3 className="mt-1 text-xl font-bold text-balance text-navy">
              {entry.title}
            </h3>
            <p className="mt-2 text-ink">{entry.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
