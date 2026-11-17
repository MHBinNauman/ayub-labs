import { Quote } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui";
import type { testimonials as testimonialsData } from "@/data/site-data";

const sourceLabel = { google: "Google review", direct: "Patient feedback" };

/**
 * Real reviews only, used with permission. Rendered only when
 * resolvedFeatures.testimonials is true; empty list → nothing.
 */
export function TestimonialsSection({
  testimonials,
}: {
  testimonials: typeof testimonialsData;
}) {
  if (testimonials.length === 0) return null;

  return (
    <Section
      spacing="lg"
      background="surface"
      aria-labelledby="reviews-heading"
    >
      <SectionHeading
        id="reviews-heading"
        eyebrow="Reviews"
        title="What patients say"
      />
      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((review) => (
          <li
            key={`${review.author}-${review.quote.slice(0, 24)}`}
            className="rounded-card bg-white p-6 shadow-card"
          >
            <figure>
              <Quote aria-hidden="true" className="size-6 text-brand-red" />
              <blockquote className="mt-3 text-ink">{review.quote}</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-navy">{review.author}</span>
                <span className="text-muted">
                  {" "}
                  · {sourceLabel[review.source]}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
