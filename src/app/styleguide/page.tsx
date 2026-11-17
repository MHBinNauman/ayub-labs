/**
 * TEMPORARY brand review page. Delete before launch.
 * Not indexed (robots below) and must never be listed in the sitemap.
 * All sample content is read from site-data.ts; nothing here is invented copy.
 */
import type { Metadata } from "next";
import { MessageCircle, Phone } from "lucide-react";
import type { ReactNode } from "react";
import {
  Accordion,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui";
import { Reveal } from "@/components/ui/Reveal";
import { Tabs } from "@/components/ui/Tabs";
import {
  brand,
  brandTokens,
  contact,
  serviceCategories,
  services,
} from "@/data/site-data";
import { formatWeekHours, getBranchStatus } from "@/lib/hours";
import { tel, whatsapp } from "@/lib/links";
import { primaryBranch, servicesByCategory } from "@/lib/site";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const swatches: {
  utility: string;
  className: string;
  value: string;
  use: string;
}[] = [
  {
    utility: "navy",
    className: "bg-navy",
    value: brandTokens.colors.navy,
    use: "Primary: buttons, headings",
  },
  {
    utility: "brand-blue",
    className: "bg-brand-blue",
    value: brandTokens.colors.logoBlue,
    use: "Logo blue: hover, focus ring",
  },
  {
    utility: "brand-red",
    className: "bg-brand-red",
    value: brandTokens.colors.logoRed,
    use: "Accent: fills, large text",
  },
  {
    utility: "brand-red-text",
    className: "bg-brand-red-text",
    value: brandTokens.colors.redText,
    use: "Small red text",
  },
  {
    utility: "ink",
    className: "bg-ink",
    value: brandTokens.colors.ink,
    use: "Body text",
  },
  {
    utility: "muted",
    className: "bg-muted",
    value: brandTokens.colors.muted,
    use: "Secondary text",
  },
  {
    utility: "surface",
    className: "bg-surface",
    value: brandTokens.colors.surface,
    use: "Section background",
  },
  {
    utility: "tint",
    className: "bg-tint",
    value: brandTokens.colors.tint,
    use: "Card and section tint",
  },
  {
    utility: "whatsapp",
    className: "bg-whatsapp",
    value: brandTokens.colors.whatsapp,
    use: "WhatsApp button only",
  },
  {
    utility: "status-open",
    className: "bg-status-open",
    value: "globals.css",
    use: "Open-now dot only",
  },
];

const weights: { className: string; weight: number }[] = [
  { className: "font-normal", weight: 400 },
  { className: "font-medium", weight: 500 },
  { className: "font-semibold", weight: 600 },
  { className: "font-bold", weight: 700 },
  { className: "font-extrabold", weight: 800 },
];

const buttonVariants = [
  "primary",
  "secondary",
  "accent",
  "whatsapp",
  "ghost",
] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

// Fixed instants, so the page shows both states whatever the time is:
// Tuesday 1:00 PM and Sunday 1:00 PM in Karachi.
const openExample = getBranchStatus(
  primaryBranch,
  new Date("2026-11-17T08:00:00Z"),
);
const closedExample = getBranchStatus(
  primaryBranch,
  new Date("2026-11-22T08:00:00Z"),
);

const firstService = services[0];

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-10">
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <>
      <Section spacing="sm" background="surface">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Styleguide" }]}
        />
        <SectionHeading
          as="h1"
          className="mt-6"
          eyebrow="Temporary review page"
          title={`${brand.displayName} styleguide`}
          sub="Every UI primitive in every variant. Not indexed; delete before launch."
        />
      </Section>

      <Section>
        <SectionHeading eyebrow="Tokens" title="Colour" />
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {swatches.map((swatch) => (
            <li key={swatch.utility}>
              <div
                className={`${swatch.className} h-20 rounded-card border border-ink/10`}
              />
              <p className="mt-2 font-semibold text-ink">{swatch.utility}</p>
              <p className="text-sm text-muted">{swatch.value}</p>
              <p className="text-sm text-muted">{swatch.use}</p>
            </li>
          ))}
        </ul>

        <SectionHeading className="mt-16" eyebrow="Tokens" title="Typography" />
        <Group title={`${brandTokens.font.family}, weights 400 to 800`}>
          <ul className="space-y-2">
            {weights.map(({ className, weight }) => (
              <li key={weight} className={`${className} text-2xl text-navy`}>
                {brand.displayName}{" "}
                <span className="text-base font-normal text-muted">
                  {weight}
                </span>
              </li>
            ))}
          </ul>
        </Group>
        <Group title="Body and muted text">
          <p className="max-w-prose text-ink">{brand.aboutDraft}</p>
          <p className="mt-2 max-w-prose text-muted">{firstService.summary}</p>
          <p className="mt-2 text-sm font-semibold text-brand-red-text">
            {brand.tagline.value}
          </p>
        </Group>
      </Section>

      <Section background="surface">
        <SectionHeading eyebrow="Component" title="Button" />
        {buttonVariants.map((variant) => (
          <Group key={variant} title={variant}>
            <div className="flex flex-wrap items-center gap-3">
              {buttonSizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant} {size}
                </Button>
              ))}
            </div>
          </Group>
        ))}
        <Group title="As links, with icons">
          <div className="flex flex-wrap items-center gap-3">
            <Button href={tel(contact.landline.e164)}>
              <Phone aria-hidden="true" className="size-5" />
              Call {contact.landline.display}
            </Button>
            <Button variant="whatsapp" href={whatsapp(contact.whatsapp.number)}>
              <MessageCircle aria-hidden="true" className="size-5" />
              WhatsApp {contact.whatsapp.display}
            </Button>
            <Button variant="secondary" href="/">
              Home (internal link)
            </Button>
          </div>
        </Group>
        <Group title="Disabled">
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>primary</Button>
            <Button variant="secondary" disabled>
              secondary
            </Button>
            <Button variant="accent" disabled>
              accent
            </Button>
          </div>
        </Group>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Component"
          title="Card"
          sub="Hover lifts 2px with a deeper shadow. No movement under reduced motion."
        />
        <Group title="With lift">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <Card as="li" key={service.slug}>
                <h4 className="text-lg font-bold text-navy">{service.name}</h4>
                <p className="mt-2 text-muted">{service.summary}</p>
              </Card>
            ))}
          </ul>
        </Group>
        <Group title="Static (lift off)">
          <Card lift={false} className="max-w-md">
            <h4 className="text-lg font-bold text-navy">
              {primaryBranch.name}
            </h4>
            <address className="mt-2 text-ink not-italic">
              {primaryBranch.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <dl className="mt-4 space-y-1">
              {formatWeekHours(primaryBranch).map((row) => (
                <div key={row.days} className="flex justify-between gap-4">
                  <dt className="text-muted">{row.days}</dt>
                  <dd className="font-semibold text-ink">{row.hours}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </Group>

        <SectionHeading className="mt-16" eyebrow="Component" title="Badge" />
        <Group title="Open, closed, neutral">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="open">{openExample.label}</Badge>
            <Badge variant="closed">{closedExample.label}</Badge>
            <Badge>{primaryBranch.city}</Badge>
          </div>
        </Group>

        <SectionHeading
          className="mt-16"
          eyebrow="Component"
          title="Breadcrumbs"
        />
        <Group title="Three levels">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: firstService.name },
            ]}
          />
        </Group>
      </Section>

      <Section background="tint">
        <SectionHeading eyebrow="Component" title="Section heading" />
        <Group title="Left aligned">
          <SectionHeading
            eyebrow={serviceCategories.laboratory.label}
            title={brand.tagline.value}
            sub={brand.aboutDraft}
          />
        </Group>
        <Group title="Centred">
          <SectionHeading
            align="center"
            eyebrow={serviceCategories.diagnostics.label}
            title={brand.tagline.value}
            sub={serviceCategories.diagnostics.blurb}
          />
        </Group>
        <Group title="Section backgrounds">
          <p className="max-w-prose text-ink">
            This band uses the tint background. The bands above use white and
            surface.
          </p>
        </Group>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Component"
          title="Tabs"
          sub="Arrow keys, Home and End move between tabs."
        />
        <Tabs
          className="mt-8"
          label="Service categories"
          tabs={servicesByCategory.map((group) => ({
            id: group.category,
            label: group.label,
            content: (
              <ul className="grid gap-4 sm:grid-cols-2">
                {group.services.map((service) => (
                  <li key={service.slug}>
                    <p className="font-bold text-navy">{service.name}</p>
                    <p className="text-muted">{service.summary}</p>
                  </li>
                ))}
              </ul>
            ),
          }))}
        />

        <SectionHeading
          className="mt-16"
          eyebrow="Component"
          title="Accordion"
          sub="Native details elements. One open at a time in this example."
        />
        <Accordion
          className="mt-8 max-w-3xl"
          exclusive
          items={services.slice(0, 4).map((service, index) => ({
            title: service.name,
            content: <p>{service.summary}</p>,
            defaultOpen: index === 0,
          }))}
        />
      </Section>

      <Section background="surface" spacing="lg">
        <SectionHeading
          eyebrow="Component"
          title="Reveal"
          sub="Scroll down: each card fades up 12px once. Nothing animates under reduced motion."
        />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(3).map((service, index) => (
            <li key={service.slug}>
              <Reveal delay={(index % 4) * 0.08}>
                <Card lift={false} className="h-full">
                  <h4 className="font-bold text-navy">{service.name}</h4>
                  <p className="mt-2 text-sm text-muted">{service.summary}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Container className="py-8 text-sm text-muted">
        Container: max-w-7xl with responsive side padding. This line sits in
        one.
      </Container>
    </>
  );
}
