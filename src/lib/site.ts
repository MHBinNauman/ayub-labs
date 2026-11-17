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

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

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
