/**
 * Values derived from site-data.ts. Components read these instead of
 * re-deriving them, so "what counts as the primary branch" or "is the doctors
 * section on" has one answer.
 */
import {
  brand,
  branches,
  contact,
  doctors,
  features,
  registrations,
  serviceCategories,
  services,
  stats,
  testimonials,
  timezone,
  type Branch,
  type Service,
  type ServiceCategory,
} from "@/data/site-data";

/* ------------------------------------------------------------------ */
/* Years serving                                                       */
/* ------------------------------------------------------------------ */

const yearFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: timezone,
  year: "numeric",
});

/**
 * Full years of service we can state for certain. Only the founding year is
 * known, not the month, so the count is one less than the year difference:
 * founded 2016, any date in 2026 → "9+ years".
 *
 * Reads the clock when `now` is omitted, so on a prerendered page call it
 * inside a "use cache" scope.
 */
export function yearsServing(
  now: Date = new Date(),
): { years: number; label: string } | null {
  const years = currentYear(now) - brand.foundedYear.value - 1;
  return years >= 1 ? { years, label: `${years}+ years` } : null;
}

/**
 * The calendar year in Karachi, e.g. for the copyright line. Reads the clock
 * when `now` is omitted, so on a prerendered page call it inside a
 * "use cache" scope.
 */
export function currentYear(now: Date = new Date()): number {
  return Number(yearFormatter.format(now));
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

/**
 * The number behind every generic "Call" button. The mobile, because it is
 * the one number that reaches both branches (F-8 has no landline on record).
 */
export const primaryPhone = contact.mobile;

/** Pre-filled text for WhatsApp chats opened from the site. */
export const whatsappGreeting = `Hello ${brand.shortName}, I'd like to ask about…`;

/** Pre-filled WhatsApp text from a service page with no published test list. */
export function serviceQuestionMessage(serviceName: string): string {
  return `Hello ${brand.shortName}, I'd like to ask about ${serviceName}: which tests do you offer, and what are the prices?`;
}

/** Pre-filled WhatsApp text when a services search finds nothing. */
export function searchQuestionMessage(query: string): string {
  return `Hello ${brand.shortName}, do you offer "${query.trim()}"?`;
}

/** Pre-filled text for asking for a report on WhatsApp (no online portal yet). */
export const reportRequestMessage = `Hello ${brand.shortName}, I'd like to request my test report.`;

/**
 * Human-readable form of an E.164 number. Numbers listed in `contact` use the
 * display string written there; anything else is formatted as a Pakistani
 * number ("+923001234567" → "0300-1234567"), or returned unchanged if it is
 * not one.
 */
export function formatPhone(e164: string): string {
  const known = [contact.mobile, contact.landline].find(
    (entry) => entry.e164 === e164,
  );
  if (known) return known.display;

  const national = e164.startsWith("+92") ? e164.slice(3) : null;
  if (!national) return e164;
  if (/^3\d{9}$/.test(national)) {
    return `0${national.slice(0, 3)}-${national.slice(3)}`;
  }
  return `0${national}`;
}

/* ------------------------------------------------------------------ */
/* Branches                                                            */
/* ------------------------------------------------------------------ */

export const primaryBranch: Branch =
  branches.find((branch) => branch.isPrimary) ?? branches[0];

export type CityGroup = { city: Branch["city"]; branches: Branch[] };

/** Branches grouped by city, in the order cities first appear in the data. */
export const branchesByCity: CityGroup[] = branches.reduce<CityGroup[]>(
  (groups, branch) => {
    const group = groups.find((g) => g.city === branch.city);
    if (group) {
      group.branches.push(branch);
    } else {
      groups.push({ city: branch.city, branches: [branch] });
    }
    return groups;
  },
  [],
);

/**
 * The regulator a branch may display, or null when the registration is
 * unverified or still a TODO. Never render `branch.regulator.value` directly.
 */
export function branchRegulator(
  branch: Pick<Branch, "regulator">,
): string | null {
  return branch.regulator.verified ? branch.regulator.value : null;
}

/**
 * Branches where a service is available. site-data.ts does not yet record
 * this per service (see openQuestions), so for now every branch is listed.
 */
export function branchesOffering(service: Pick<Service, "slug">): Branch[] {
  void service;
  return branches;
}

/** Cities with a branch, in data order, e.g. ["Rawalpindi", "Islamabad"]. */
export const cities: Branch["city"][] = branchesByCity.map(
  (group) => group.city,
);

/* ------------------------------------------------------------------ */
/* Registrations                                                       */
/* ------------------------------------------------------------------ */

/** Registrations the site may show. The only trust claim allowed. */
export const verifiedRegistrations = registrations.filter(
  (registration) => registration.verified,
);

/** "PHC & PNRA" */
export const registeredWithShort = joinList(
  verifiedRegistrations.map((registration) => registration.short),
  "&",
);

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

/** ["a", "b", "c"] → "a, b and c". */
export function joinList(
  items: readonly string[],
  conjunction = "and",
): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items.at(-1)}`;
}

/** Lower-cases a name for use mid-sentence, leaving acronyms ("ECG") alone. */
function midSentence(name: string): string {
  return /^[A-Z][A-Z]/.test(name)
    ? name
    : name[0].toLowerCase() + name.slice(1);
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

/**
 * How each category reads in a sentence. Diagnostics are named one by one
 * because each is a distinct test a patient searches for.
 */
const categoryPhrases: Record<ServiceCategory, (items: Service[]) => string[]> =
  {
    laboratory: () => ["laboratory testing"],
    diagnostics: (items) => items.map((service) => midSentence(service.name)),
    clinics: () => ["specialist clinics"],
    pharmacy: () => ["an on-site pharmacy"],
  };

/**
 * What the practice offers, as a phrase built from the service list, e.g.
 * "laboratory testing, ECG, ultrasound & Doppler and specialist clinics".
 * Categories with no services are left out.
 */
export function offeringPhrase(
  categories: readonly ServiceCategory[] = Object.keys(
    serviceCategories,
  ) as ServiceCategory[],
): string {
  const parts = categories.flatMap((category) => {
    const items = services.filter((service) => service.category === category);
    return items.length > 0 ? categoryPhrases[category](items) : [];
  });
  return joinList(parts);
}

export type ServiceGroup = {
  category: ServiceCategory;
  label: string;
  blurb: string;
  services: Service[];
};

/** Services grouped by category, in category order. Empty categories are dropped. */
export const servicesByCategory: ServiceGroup[] = (
  Object.keys(serviceCategories) as ServiceCategory[]
)
  .map((category) => ({
    category,
    ...serviceCategories[category],
    services: services.filter((service) => service.category === category),
  }))
  .filter((group) => group.services.length > 0);

/* ------------------------------------------------------------------ */
/* Feature flags                                                       */
/* ------------------------------------------------------------------ */

export type ResolvedFeatures = {
  testDirectory: boolean;
  homeSampling: boolean;
  doctorsSection: boolean;
  statsSection: boolean;
  testimonials: boolean;
  reportPortalUrl: string | null;
  urduToggle: boolean;
};

/**
 * Flags as the UI should read them. Sections backed by a list switch on by
 * themselves once the list has entries; validate.ts fails the build if a flag
 * is forced on while its list is empty.
 */
export const resolvedFeatures: ResolvedFeatures = {
  testDirectory: features.testDirectory,
  homeSampling: features.homeSampling,
  doctorsSection: features.doctorsSection || doctors.length > 0,
  statsSection: features.statsSection || stats.length > 0,
  testimonials: features.testimonials || testimonials.length > 0,
  reportPortalUrl: features.reportPortalUrl,
  urduToggle: features.urduToggle,
};

/* ------------------------------------------------------------------ */
/* Prices                                                              */
/* ------------------------------------------------------------------ */

const pkrFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

/** 1500 → "Rs 1,500". */
export function formatPKR(amount: number): string {
  return pkrFormatter.format(amount);
}
