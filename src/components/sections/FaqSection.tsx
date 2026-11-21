import { Accordion, Section, SectionHeading } from "@/components/ui";
import type { faqs as faqsData } from "@/data/site-data";
import { faqPageJsonLd, JsonLd } from "@/lib/seo";

/**
 * Patient FAQs with matching FAQPage structured data. Google requires the
 * markup to describe questions visible on the page, so both render together
 * and an empty list renders neither.
 */
export function FaqSection({ faqs }: { faqs: typeof faqsData }) {
  if (faqs.length === 0) return null;

  return (
    <Section spacing="lg" aria-labelledby="faq-heading">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <SectionHeading
        id="faq-heading"
        eyebrow="FAQ"
        title="Common questions"
        align="center"
      />
      <Accordion
        className="mx-auto mt-10 max-w-3xl"
        items={faqs.map((faq) => ({
          title: faq.question,
          content: <p>{faq.answer}</p>,
        }))}
      />
    </Section>
  );
}
