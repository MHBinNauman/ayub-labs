/**
 * Build-time validation of src/data/site-data.ts.
 *
 * The root layout calls validateSiteData() at module scope, so `next build`
 * (and the dev server) fail with a readable list of problems instead of
 * shipping a broken phone link or placeholder text. Server-only: do not
 * import this from a client component.
 */
import { z } from "zod";
import * as siteData from "@/data/site-data";
import type {
  Branch,
  DayHours,
  DayKey,
  Service,
  TestItem,
} from "@/data/site-data";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const text = z.string().min(1, "must not be empty");

const e164 = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "phone must be E.164, e.g. +923001234567");

const whatsappNumber = z
  .string()
  .regex(
    /^[1-9]\d{7,14}$/,
    'WhatsApp number must be E.164 digits without "+", e.g. 923001234567',
  );

const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be lowercase kebab-case");

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'time must be 24h "HH:mm"');

const sitePath = z.string().startsWith("/", 'must start with "/"');

const color = z
  .string()
  .regex(
    /^(#[0-9a-fA-F]{6}|rgba?\([\d\s.,%]+\))$/,
    "must be a hex or rgb(a) colour",
  );

const verified = <T extends z.ZodType>(value: T) =>
  z.strictObject({ value, verified: z.boolean(), note: z.string().optional() });

/* ------------------------------------------------------------------ */
/* Schemas mirroring the types in site-data.ts                         */
/* ------------------------------------------------------------------ */

const dayHoursSchema: z.ZodType<DayHours> = z
  .strictObject({ open: time, close: time })
  .refine((hours) => hours.open < hours.close, "open must be before close")
  .nullable();

const weekHoursSchema: z.ZodType<Record<DayKey, DayHours>> = z
  .strictObject({
    mon: dayHoursSchema,
    tue: dayHoursSchema,
    wed: dayHoursSchema,
    thu: dayHoursSchema,
    fri: dayHoursSchema,
    sat: dayHoursSchema,
    sun: dayHoursSchema,
  })
  .refine(
    (week) => Object.values(week).some((day) => day !== null),
    "branch has no opening hours",
  );

const testItemSchema: z.ZodType<TestItem> = z.strictObject({
  code: text.optional(),
  name: text,
  aka: z.array(text).optional(),
  sample: text.optional(),
  fasting: z.boolean().optional(),
  turnaround: text.optional(),
  pricePKR: z.number().positive().optional(),
  homeSampling: z.boolean().optional(),
});

const serviceCategorySchema = z.enum([
  "laboratory",
  "diagnostics",
  "clinics",
  "pharmacy",
]);

const serviceSchema: z.ZodType<Service> = z.strictObject({
  slug,
  name: text,
  category: serviceCategorySchema,
  legacyName: z.string(),
  summary: text,
  icon: text,
  tests: z.array(testItemSchema),
  copyApproved: z.boolean(),
});

const branchSchema: z.ZodType<Branch> = z.strictObject({
  id: slug,
  name: text,
  city: z.enum(["Rawalpindi", "Islamabad"]),
  area: text,
  addressLines: z.array(text).min(1),
  addressVerbatim: z.string(),
  phones: z.array(e164).min(1, "branch needs at least one phone"),
  whatsapp: whatsappNumber.optional(),
  hours: weekHoursSchema,
  hoursVerified: z.boolean(),
  mapQuery: text,
  geo: z
    .strictObject({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  googleMapsUrl: z.httpUrl().optional(),
  regulator: verified(z.string()),
  isPrimary: z.boolean(),
});

/** Reports each value of `key` that appears more than once in a list. */
function unique<T>(key: (item: T) => string, noun: string) {
  return (items: T[], ctx: z.core.$RefinementCtx<T[]>) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      const value = key(item);
      if (seen.has(value)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate ${noun} "${value}"`,
          path: [index],
        });
      }
      seen.add(value);
    });
  };
}

const phoneContact = z.strictObject({
  e164,
  display: text,
  verified: z.boolean(),
});

const siteDataSchema = z.strictObject({
  brand: z.strictObject({
    legalName: verified(text),
    displayName: text,
    shortName: text,
    tagline: verified(text),
    foundedYear: verified(z.number().int().min(1900).max(2100)),
    aboutVerbatim: z.string(),
    aboutDraft: text,
    domain: z
      .string()
      .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, "must be a bare domain"),
    email: z.email(),
  }),

  contact: z.strictObject({
    mobile: phoneContact,
    landline: phoneContact,
    whatsapp: z.strictObject({
      number: whatsappNumber,
      display: text,
      verified: z.boolean(),
    }),
    email: verified(z.email()),
    social: z.strictObject({
      facebook: z.httpUrl().nullable(),
      instagram: z.httpUrl().nullable(),
      googleBusiness: z.httpUrl().nullable(),
    }),
  }),

  timezone: z.string().refine((zone) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone });
      return true;
    } catch {
      return false;
    }
  }, "must be a valid IANA timezone"),

  branches: z
    .array(branchSchema)
    .min(1)
    .superRefine(unique((branch) => branch.id, "branch id"))
    .refine(
      (list) => list.filter((branch) => branch.isPrimary).length === 1,
      "exactly one branch must have isPrimary: true",
    ),

  registrations: z.array(
    z.strictObject({
      id: slug,
      short: text,
      name: text,
      // Registration is the only trust claim allowed (CLAUDE.md rule 2).
      claim: z.literal("Registered"),
      logo: z.string().startsWith("/brand/"),
      appliesTo: z.array(z.string()).min(1),
      verified: z.boolean(),
      registrationNo: text.nullable(),
      note: z.string().optional(),
    }),
  ),

  serviceCategories: z.strictObject({
    laboratory: z.strictObject({ label: text, blurb: text }),
    diagnostics: z.strictObject({ label: text, blurb: text }),
    clinics: z.strictObject({ label: text, blurb: text }),
    pharmacy: z.strictObject({ label: text, blurb: text }),
  }),

  services: z
    .array(serviceSchema)
    .superRefine(unique((service) => service.slug, "service slug")),

  doctors: z.array(
    z.strictObject({
      name: text,
      title: text,
      qualifications: text,
      serviceSlugs: z.array(z.string()),
      photo: text.optional(),
      pmdcNo: text.optional(),
    }),
  ),

  stats: z.array(
    z.strictObject({
      label: text,
      // A zero renders as the broken "0 K" counter from the old site.
      value: z.number().positive("stat value must be greater than 0"),
      suffix: z.string().optional(),
    }),
  ),

  testimonials: z.array(
    z.strictObject({
      quote: text,
      author: text,
      source: z.enum(["google", "direct"]),
    }),
  ),

  features: z.strictObject({
    testDirectory: z.boolean(),
    homeSampling: z.boolean(),
    doctorsSection: z.boolean(),
    statsSection: z.boolean(),
    testimonials: z.boolean(),
    reportPortalUrl: z.httpUrl().nullable(),
    urduToggle: z.boolean(),
  }),

  brandTokens: z.strictObject({
    colors: z.strictObject({
      logoBlue: color,
      logoRed: color,
      navy: color,
      surface: color,
      tint: color,
      ink: color,
      muted: color,
      redText: color,
      whatsapp: color,
    }),
    contrast: z.record(z.string(), z.number().positive()),
    font: z.strictObject({
      family: text,
      source: text,
      weights: z.array(z.number().int()).min(1),
    }),
    logo: z.strictObject({
      emblemPng: z.httpUrl(),
      emblem192: z.httpUrl(),
      wordmarkPng: z.httpUrl(),
      description: text,
      vectorAvailable: z.boolean(),
    }),
  }),

  legacyRedirects: z.array(
    z.strictObject({
      source: sitePath,
      destination: sitePath,
      permanent: z.boolean(),
    }),
  ),

  openQuestions: z.array(z.string()),
});

type SiteData = z.infer<typeof siteDataSchema>;

/* ------------------------------------------------------------------ */
/* Forbidden text in rendered strings                                  */
/* ------------------------------------------------------------------ */

const FORBIDDEN_TEXT: { pattern: RegExp; name: string }[] = [
  { pattern: /TODO/, name: '"TODO"' },
  { pattern: /lorem/i, name: '"lorem"' },
  { pattern: /\b0\s?[KM]\b/, name: 'a broken "0 K" counter' },
];

/** Fields kept for the audit trail or for us, never shown to visitors. */
const UNRENDERED_KEYS = new Set([
  "note",
  "aboutVerbatim",
  "addressVerbatim",
  "legacyName",
]);

/** Whole exports that are never shown to visitors. */
const UNRENDERED_EXPORTS = new Set(["openQuestions", "legacyRedirects"]);

/**
 * The one sanctioned way to say "missing" in site-data.ts: an unverified
 * `Verified<string>` whose value is "TODO(...)". The UI must treat it as
 * absent (see branchRegulator in site.ts), so it is not a rendered string.
 */
function isMissingMarker(value: object): boolean {
  const field = value as { value?: unknown; verified?: unknown };
  return (
    field.verified === false &&
    typeof field.value === "string" &&
    field.value.startsWith("TODO(")
  );
}

type Issue = { path: PropertyKey[]; message: string };

function scanRenderedText(
  value: unknown,
  path: PropertyKey[],
  issues: Issue[],
) {
  if (typeof value === "string") {
    for (const { pattern, name } of FORBIDDEN_TEXT) {
      if (pattern.test(value)) {
        issues.push({
          path,
          message: `rendered text contains ${name}: "${value}"`,
        });
      }
    }
  } else if (Array.isArray(value)) {
    value.forEach((item, index) =>
      scanRenderedText(item, [...path, index], issues),
    );
  } else if (typeof value === "object" && value !== null) {
    if (isMissingMarker(value)) return;
    for (const [key, child] of Object.entries(value)) {
      if (!UNRENDERED_KEYS.has(key)) {
        scanRenderedText(child, [...path, key], issues);
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Checks that span more than one export                               */
/* ------------------------------------------------------------------ */

function crossChecks(data: SiteData): Issue[] {
  const issues: Issue[] = [];
  const branchIds = new Set(data.branches.map((branch) => branch.id));
  const serviceSlugs = new Set(data.services.map((service) => service.slug));

  data.registrations.forEach((registration, r) => {
    registration.appliesTo.forEach((id, i) => {
      if (!branchIds.has(id)) {
        issues.push({
          path: ["registrations", r, "appliesTo", i],
          message: `unknown branch id "${id}"`,
        });
      }
    });
  });

  data.doctors.forEach((doctor, d) => {
    doctor.serviceSlugs.forEach((serviceSlug, i) => {
      if (!serviceSlugs.has(serviceSlug)) {
        issues.push({
          path: ["doctors", d, "serviceSlugs", i],
          message: `unknown service slug "${serviceSlug}"`,
        });
      }
    });
  });

  // A flag forced on with nothing behind it would render an empty section.
  const flagNeedsData: [keyof SiteData["features"], boolean, string][] = [
    ["doctorsSection", data.doctors.length > 0, "doctors is empty"],
    ["statsSection", data.stats.length > 0, "stats is empty"],
    ["testimonials", data.testimonials.length > 0, "testimonials is empty"],
    [
      "testDirectory",
      data.services.some((service) => service.tests.length > 0),
      "no service has any tests",
    ],
  ];
  for (const [flag, hasData, reason] of flagNeedsData) {
    if (data.features[flag] === true && !hasData) {
      issues.push({ path: ["features", flag], message: `is on but ${reason}` });
    }
  }

  return issues;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

function formatPath(path: PropertyKey[]): string {
  return path.reduce<string>((out, segment) => {
    if (typeof segment === "number") return `${out}[${segment}]`;
    return out ? `${out}.${String(segment)}` : String(segment);
  }, "");
}

/** Every problem found in `data`, as "path: message" lines. Empty when valid. */
export function findSiteDataIssues(data: unknown = { ...siteData }): string[] {
  const issues: Issue[] = [];

  const result = siteDataSchema.safeParse(data);
  if (!result.success) {
    issues.push(...result.error.issues);
  } else {
    issues.push(...crossChecks(result.data));
  }

  if (typeof data === "object" && data !== null) {
    for (const [name, value] of Object.entries(data)) {
      if (!UNRENDERED_EXPORTS.has(name)) {
        scanRenderedText(value, [name], issues);
      }
    }
  }

  return issues.map(
    ({ path, message }) => `${formatPath(path) || "(root)"}: ${message}`,
  );
}

/** Throws, listing every problem, if site-data.ts is not safe to render. */
export function validateSiteData(data?: unknown): void {
  const issues = findSiteDataIssues(data);
  if (issues.length > 0) {
    throw new Error(
      `src/data/site-data.ts failed validation (${issues.length} ${
        issues.length === 1 ? "issue" : "issues"
      }):\n${issues.map((issue) => `  - ${issue}`).join("\n")}`,
    );
  }
}
