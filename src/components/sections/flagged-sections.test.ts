/**
 * Stats, doctors and testimonials are hidden while their lists are empty.
 * These render them with sample data so they are known to work the day the
 * client supplies real entries. Sample data lives only in this test.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DoctorsSection } from "./DoctorsSection";
import { StatsSection } from "./StatsSection";
import { TestimonialsSection } from "./TestimonialsSection";

const render = (element: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(element);

describe("flag-gated sections", () => {
  it("render nothing for empty lists", () => {
    expect(render(createElement(StatsSection, { stats: [] }))).toBe("");
    expect(render(createElement(DoctorsSection, { doctors: [] }))).toBe("");
    expect(
      render(createElement(TestimonialsSection, { testimonials: [] })),
    ).toBe("");
  });

  it("render stats with grouped numbers and suffix", () => {
    const html = render(
      createElement(StatsSection, {
        stats: [{ label: "Sample label", value: 12500, suffix: "+" }],
      }),
    );
    expect(html).toContain("12,500+");
    expect(html).toContain("Sample label");
  });

  it("render a doctor without a photo or PMDC number", () => {
    const html = render(
      createElement(DoctorsSection, {
        doctors: [
          {
            name: "Sample Name",
            title: "Sample title",
            qualifications: "Sample qualifications",
            serviceSlugs: [],
          },
        ],
      }),
    );
    expect(html).toContain("Sample Name");
    expect(html).not.toContain("PMDC");
  });

  it("render a testimonial with its source", () => {
    const html = render(
      createElement(TestimonialsSection, {
        testimonials: [
          { quote: "Sample quote", author: "Sample author", source: "google" },
        ],
      }),
    );
    expect(html).toContain("Sample quote");
    expect(html).toContain("Google review");
  });
});
