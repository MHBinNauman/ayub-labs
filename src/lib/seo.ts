/**
 * Structured data (JSON-LD). Everything here restates facts already on the
 * page; it never adds claims (no ratings, accreditation or outcomes).
 */
import { createElement, type ReactElement } from "react";
import { brand, type Branch, type Service } from "@/data/site-data";
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
