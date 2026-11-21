/**
 * Structured data (JSON-LD). Everything here restates facts already on the
 * page; it never adds claims (no ratings, accreditation or outcomes).
 */
import type { Metadata } from "next";
import { createElement, type ReactElement } from "react";
import { brand, contact, type Branch, type Service } from "@/data/site-data";
import { DAY_KEYS, DAY_NAMES } from "./hours";

type JsonLdObject = Record<string, unknown>;

/** "/services/ecg" → "https://ayyublabs.com/services/ecg". */
export function absoluteUrl(path: string): string {
  return new URL(path, `https://${brand.domain}`).toString();
}

/**
 * JSON for a <script> tag. "<" is escaped so a value containing
 * "</script>" can never close the tag early (XSS).
 */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Renders a JSON-LD <script>. Server components only. */
export function JsonLd({ data }: { data: JsonLdObject }): ReactElement {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: serializeJsonLd(data) },
  });
}

/* ------------------------------------------------------------------ */
/* Page metadata                                                       */
/* ------------------------------------------------------------------ */

/** The emblem, also used as the Organization logo (192×192). */
export const LOGO_PATH = "/brand/logo-emblem-192.png";

/**
 * Title, description, canonical URL and the matching Open Graph / Twitter
 * fields for a page. The og:image comes from the route's opengraph-image.
 * `absoluteTitle` skips the "| Ayyub Labs & Clinics" template (home page).
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: brand.displayName,
      locale: "en_PK",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/* ------------------------------------------------------------------ */
/* Structured data                                                     */
/* ------------------------------------------------------------------ */

export const ORGANIZATION_ID = `${absoluteUrl("/")}#organization`;

/**
 * The practice as a whole. Rendered once, in the root layout. Only verified
 * facts: no legal name (unconfirmed) and sameAs only for profiles we have.
 */
export function organizationJsonLd(
  social: Record<string, string | null> = contact.social,
): JsonLdObject {
  const sameAs = Object.values(social).filter(
    (url): url is string => typeof url === "string" && url !== "",
  );
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "@id": ORGANIZATION_ID,
    name: brand.displayName,
    url: absoluteUrl("/"),
    logo: absoluteUrl(LOGO_PATH),
    ...(contact.email.verified && { email: contact.email.value }),
    ...(brand.foundedYear.verified && {
      foundingDate: String(brand.foundedYear.value),
    }),
    contactPoint: [contact.mobile, contact.landline]
      .filter((phone) => phone.verified)
      .map((phone) => ({
        "@type": "ContactPoint",
        telephone: phone.e164,
        contactType: "customer service",
        areaServed: "PK",
      })),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/** FAQPage markup; only render it next to the visible FAQ it describes. */
export function faqPageJsonLd(
  faqs: readonly { question: string; answer: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbJsonLd(
  crumbs: { label: string; href: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.href),
    })),
  };
}

type SchemaType = { "@type": string } & JsonLdObject;

/** Default schema.org type per category. null = no test/procedure type fits. */
const categoryTypes: Record<Service["category"], SchemaType | null> = {
  laboratory: { "@type": "MedicalTest" },
  diagnostics: { "@type": "MedicalTest" },
  // A consultation or a pharmacy is neither a test nor a procedure; labelling
  // it as one would be inaccurate structured data, so these get none.
  clinics: null,
  pharmacy: null,
};

/** More specific schema.org subtypes where one clearly fits. */
const slugTypes: Record<string, SchemaType> = {
  haematology: { "@type": "BloodTest" },
  microbiology: { "@type": "PathologyTest" },
  histopathology: { "@type": "PathologyTest" },
  "ultrasound-doppler": {
    "@type": "ImagingTest",
    imagingTechnique: "https://schema.org/Ultrasound",
  },
  "bone-marrow-aspiration-trephine-biopsy": { "@type": "MedicalProcedure" },
};

/**
 * MedicalTest / MedicalProcedure markup for a service page, or null when no
 * such type honestly describes the service (clinics, pharmacy).
 */
export function serviceJsonLd(service: Service): JsonLdObject | null {
  const type = slugTypes[service.slug] ?? categoryTypes[service.category];
  if (!type) return null;

  return {
    "@context": "https://schema.org",
    ...type,
    name: service.name,
    ...(service.legacyName !== service.name && {
      alternateName: service.legacyName,
    }),
    description: service.summary,
    url: absoluteUrl(`/services/${service.slug}`),
  };
}

/**
 * One block per branch: MedicalBusiness + DiagnosticLab with address, phones
 * and opening hours. Hours are included only when the branch's hours are
 * verified, and geo / map links only when site-data has them, so search
 * engines are never handed a guess as fact.
 */
export function branchJsonLd(branch: Branch): JsonLdObject {
  const path = `/locations/${branch.id}`;

  // Consecutive or not, days with identical hours share one specification.
  const groups = new Map<
    string,
    { opens: string; closes: string; days: string[] }
  >();
  for (const day of DAY_KEYS) {
    const hours = branch.hours[day];
    if (!hours) continue;
    const key = `${hours.open}-${hours.close}`;
    const group = groups.get(key) ?? {
      opens: hours.open,
      closes: hours.close,
      days: [],
    };
    group.days.push(DAY_NAMES[day]);
    groups.set(key, group);
  }

  return {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "DiagnosticLab"],
    "@id": `${absoluteUrl(path)}#branch`,
    name: `${brand.displayName} (${branch.name})`,
    url: absoluteUrl(path),
    parentOrganization: { "@id": ORGANIZATION_ID },
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.addressLines.join(", "),
      addressLocality: branch.city,
      addressCountry: "PK",
    },
    telephone: branch.phones.length === 1 ? branch.phones[0] : branch.phones,
    ...(branch.hoursVerified && {
      openingHoursSpecification: [...groups.values()].map((group) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: group.days,
        opens: group.opens,
        closes: group.closes,
      })),
    }),
    ...(branch.geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: branch.geo.lat,
        longitude: branch.geo.lng,
      },
    }),
    ...(branch.googleMapsUrl && { hasMap: branch.googleMapsUrl }),
  };
}
