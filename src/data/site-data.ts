/**
 * AYYUB LABS & CLINICS — SINGLE SOURCE OF TRUTH
 * ------------------------------------------------------------------
 * Every fact rendered on the website must come from this file.
 * Components never hard-code phone numbers, addresses, hours or names.
 *
 * Status conventions
 *   verified: true   → taken from ayyublabs.com (audited 17 Nov 2026)
 *   verified: false  → inferred or corrected by us; client must confirm
 *   TODO(...)        → missing; the UI must hide the element, not show a placeholder
 *
 * Source pages audited: /, /services/, /about-us/, /contact-us/, /online-report/
 */

// Test lists and prices imported from the client's spreadsheet (data/tests.csv).
// Regenerate with `pnpm import-tests`; never edit by hand.
import { generatedTests } from "./tests.generated";

export type Verified<T> = { value: T; verified: boolean; note?: string };

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type DayHours = { open: string; close: string } | null; // 24h "HH:mm", null = closed

export type ServiceCategory = "laboratory" | "diagnostics" | "clinics" | "pharmacy";

export interface Service {
  slug: string;
  name: string;
  category: ServiceCategory;
  /** Name exactly as it appears on the current site (for redirects / audit trail) */
  legacyName: string;
  /** Draft copy written by us. Generic and factual; client must approve before launch. */
  summary: string;
  icon: string; // lucide-react icon name
  /** Specific tests/procedures offered under this service. Empty until client supplies list. */
  tests: TestItem[];
  copyApproved: boolean;
}

export interface TestItem {
  code?: string;
  name: string;
  aka?: string[]; // search synonyms, e.g. ["CBC", "Blood CP"]
  sample?: string; // e.g. "Blood (EDTA)"
  fasting?: boolean;
  turnaround?: string; // e.g. "Same day"
  pricePKR?: number;
  homeSampling?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  city: "Rawalpindi" | "Islamabad";
  area: string;
  addressLines: string[];
  addressVerbatim: string; // exactly as on current site
  phones: string[]; // E.164
  whatsapp?: string; // E.164 without "+"
  hours: Record<DayKey, DayHours>;
  hoursVerified: boolean;
  /** Free-text query for the keyless Google Maps embed until exact coords are known */
  mapQuery: string;
  geo?: { lat: number; lng: number }; // TODO(client): drop a pin in Google Maps and copy coords
  googleMapsUrl?: string; // TODO(client): Google Business Profile link
  regulator: Verified<string>;
  isPrimary: boolean;
}

/* ------------------------------------------------------------------ */
/* 1. IDENTITY                                                         */
/* ------------------------------------------------------------------ */

export const brand = {
  legalName: { value: "Ayyub Labs and Clinics", verified: false, note: "Confirm registered business name (Pvt) Ltd / sole proprietorship?" },
  displayName: "Ayyub Labs & Clinics", // logo wordmark
  shortName: "Ayyub Labs",
  tagline: { value: "In Quality We Believe", verified: true, note: "Text on the circular logo emblem" },
  foundedYear: { value: 2016, verified: true, note: "'serving in the health sector since 2016' — About Us" },
  aboutVerbatim:
    "Ayyub labs and clinics is serving in the health sector since 2016, we are providing the patients with reliable test results and making it easier for patients to access our services. We are committed to deliver quality healthcare.",
  /** Our rewrite of the verbatim copy. Client to approve. */
  aboutDraft:
    "Since 2016, Ayyub Labs & Clinics has given patients in Rawalpindi and Islamabad reliable diagnostic results and easy access to care: laboratory testing, diagnostics and specialist consultations under one roof.",
  domain: "ayyublabs.com",
  email: "info@ayyublabs.com",
} as const;

/* ------------------------------------------------------------------ */
/* 2. CONTACT                                                          */
/* ------------------------------------------------------------------ */

export const contact = {
  /** Mobile — shown on current site as (+92) 322-5135060 / 03225135060 */
  mobile: { e164: "+923225135060", display: "0322-5135060", verified: true },
  /** Landline — shown as (051) 8448533 */
  landline: { e164: "+92518448533", display: "(051) 844-8533", verified: true },
  /** Number configured in the site's existing WhatsApp chat widget */
  whatsapp: { number: "923225135060", display: "0322-5135060", verified: true },
  email: { value: "info@ayyublabs.com", verified: true },
  social: {
    facebook: null as string | null, // TODO(client): current site links to "#"
    instagram: null as string | null, // TODO(client): current site links to "#"
    googleBusiness: null as string | null, // TODO(client)
  },
} as const;

/* ------------------------------------------------------------------ */
/* 3. HOURS                                                            */
/* ------------------------------------------------------------------ */

const standardHours: Record<DayKey, DayHours> = {
  mon: { open: "10:00", close: "21:00" },
  tue: { open: "10:00", close: "21:00" },
  wed: { open: "10:00", close: "21:00" },
  thu: { open: "10:00", close: "21:00" },
  fri: { open: "10:00", close: "21:00" },
  sat: { open: "10:00", close: "21:00" },
  sun: null, // Not listed on current site → treated as closed. TODO(client): confirm.
};

export const timezone = "Asia/Karachi";

/* ------------------------------------------------------------------ */
/* 4. BRANCHES                                                         */
/* ------------------------------------------------------------------ */

export const branches: Branch[] = [
  {
    id: "saddar-rawalpindi",
    name: "Saddar, Rawalpindi",
    city: "Rawalpindi",
    area: "Saddar",
    addressLines: [
      "2nd Floor, Mega Medical Complex",
      "Opposite Air Force Recruitment Centre, Police Station Road",
      "Saddar, Rawalpindi",
    ],
    addressVerbatim:
      "2 floor Mega Medical Complex opposite to Airforce Requirement Center, police station road, saddar rwp",
    phones: ["+92518448533", "+923225135060"],
    whatsapp: "923225135060",
    hours: standardHours,
    hoursVerified: true,
    mapQuery:
      "Ayyub Labs & Clinics, 2nd Floor, Mega Medical Complex, opposite Air Force Recruitment Center, Saddar, Rawalpindi",
    regulator: { value: "Punjab Healthcare Commission (PHC)", verified: true, note: "Site says 'Registered with Punjab Health Care (PHC)'" },
    isPrimary: true,
  },
  {
    id: "f8-islamabad",
    name: "F-8, Islamabad",
    city: "Islamabad",
    area: "F-8 Markaz",
    addressLines: [
      "Shop No. 2, Plot No. 14-X, Lower Ground Floor",
      "Parkland Medical Center",
      "F-8, Islamabad",
    ],
    addressVerbatim:
      "Ayyub lab and clinics Shop no 2 Plot no 14x lower ground floor, parkland medical center F8 islamabad",
    phones: ["+923225135060"], // TODO(client): does F-8 have its own landline?
    whatsapp: "923225135060",
    hours: standardHours, // TODO(client): confirm F-8 hours; current site lists one set of hours only
    hoursVerified: false,
    mapQuery: "Parkland Medical Center, F-8, Islamabad",
    regulator: {
      value: "TODO(client)",
      verified: false,
      note: "Islamabad facilities fall under the Islamabad Healthcare Regulatory Authority (IHRA), not PHC. Confirm registration before showing any badge on this branch.",
    },
    isPrimary: false,
  },
];

/* ------------------------------------------------------------------ */
/* 5. REGISTRATIONS / TRUST                                            */
/* ------------------------------------------------------------------ */

export const registrations = [
  {
    id: "phc",
    short: "PHC",
    name: "Punjab Healthcare Commission",
    claim: "Registered", // NEVER write "accredited": registration ≠ accreditation
    /** Plain-language line shown under the badge on /about. */
    explainer: "PHC registers healthcare establishments in Punjab.",
    logo: "/brand/badges/phc.png", // from https://ayyublabs.com/wp-content/uploads/2024/07/PHC.png
    appliesTo: ["saddar-rawalpindi"],
    verified: true,
    registrationNo: null as string | null, // TODO(client)
  },
  {
    id: "pnra",
    short: "PNRA",
    name: "Pakistan Nuclear Regulatory Authority",
    claim: "Registered",
    explainer: "PNRA licenses facilities that use radiation equipment.",
    logo: "/brand/badges/pnra.png", // from https://ayyublabs.com/wp-content/uploads/2024/07/PNRA.png
    appliesTo: ["saddar-rawalpindi"], // TODO(client): which branch/equipment does this licence cover?
    verified: true,
    registrationNo: null as string | null, // TODO(client)
    note: "PNRA licenses radiation equipment (e.g. X-ray). No X-ray service is listed on the current site; confirm what the licence covers.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* 5a. OUR STORY + QUALITY PROMISE (/about)                            */
/* ------------------------------------------------------------------ */

export interface TimelineEntry { year: number; title: string; text: string; verified: boolean; note?: string }

/**
 * Milestones for the "Our story" timeline on /about, oldest first.
 * CLIENT: add a milestone as one more entry (year, short title, one sentence),
 * e.g. when a branch opened. Only add what you can stand behind.
 * The final "Today" entry is generated from `branches`; don't add it here.
 */
export const timeline: TimelineEntry[] = [
  { year: brand.foundedYear.value, title: "Founded", verified: true, note: "About Us: 'serving in the health sector since 2016'",
    text: "Ayyub Labs & Clinics begins serving patients in the health sector." },
  // TODO(client): year each branch opened (Saddar, F-8)?
];

/**
 * What "In Quality We Believe" (brand.tagline) means in practice. Each point
 * restates the client's own About Us text; nothing here is a new claim.
 */
export const qualityPromise = [
  { id: "reliable", title: "Reliable results", text: "Giving patients test results they can rely on.", verified: true,
    note: "About Us: 'providing the patients with reliable test results'" },
  { id: "access", title: "Easy to reach", text: "Making it easier for patients to access our services.", verified: true,
    note: "About Us: 'making it easier for patients to access our services'" },
  { id: "care", title: "Quality healthcare", text: "A commitment to delivering quality healthcare.", verified: true,
    note: "About Us: 'We are committed to deliver quality healthcare.'" },
] as const;

/* ------------------------------------------------------------------ */
/* 5b. POLICIES shown to patients                                      */
/* ------------------------------------------------------------------ */

export const policies = {
  reportRelease: {
    value: "Reports are only shared with the patient or a person they have authorised.",
    verified: false,
    note: "Wording from the brief; confirm what ID or authorisation is required.",
  },
} as const;

/* ------------------------------------------------------------------ */
/* 6. SERVICES (11 on current /services/ page, no descriptions/prices) */
/* ------------------------------------------------------------------ */

export const serviceCategories: Record<ServiceCategory, { label: string; blurb: string }> = {
  laboratory: { label: "Laboratory", blurb: "Pathology and molecular testing" },
  diagnostics: { label: "Diagnostics", blurb: "Cardiac and imaging investigations" },
  clinics: { label: "Clinics & Consultations", blurb: "Specialist and remote consultations" },
  pharmacy: { label: "Pharmacy", blurb: "Medicines on site" },
};

const serviceList: Service[] = [
  { slug: "haematology", name: "Haematology", legacyName: "Haematology", category: "laboratory", icon: "Droplets", tests: [], copyApproved: false,
    summary: "Blood tests that assess blood cells, haemoglobin and clotting, used for routine check-ups and for investigating anaemia, infection and bleeding disorders." },
  { slug: "microbiology", name: "Microbiology", legacyName: "Microbiology", category: "laboratory", icon: "Microscope", tests: [], copyApproved: false,
    summary: "Culture and sensitivity testing to identify bacteria and other organisms causing infection, and the antibiotics they respond to." },
  { slug: "histopathology", name: "Histopathology", legacyName: "Histopathology", category: "laboratory", icon: "ScanSearch", tests: [], copyApproved: false,
    summary: "Microscopic examination of tissue samples (biopsies) to support diagnosis, including of cancers." },
  { slug: "pcr-lab", name: "PCR Lab", legacyName: "PCR Lab", category: "laboratory", icon: "Dna", tests: [], copyApproved: false,
    summary: "Molecular testing that detects the genetic material of viruses and other pathogens with high sensitivity." },
  { slug: "bone-marrow-aspiration-trephine-biopsy", name: "Bone Marrow Aspiration & Trephine Biopsy", legacyName: "Bone Marrow Aspiration/Terphine Bio", category: "laboratory", icon: "Syringe", tests: [], copyApproved: false,
    summary: "Sampling of bone marrow to investigate blood disorders and certain cancers, performed by a specialist." },
  { slug: "ecg", name: "ECG", legacyName: "ECG", category: "diagnostics", icon: "HeartPulse", tests: [], copyApproved: false,
    summary: "A quick, painless recording of the heart's electrical activity to check rhythm and detect signs of heart disease." },
  { slug: "ultrasound-doppler", name: "Ultrasound & Doppler", legacyName: "Ultrasound/Doppler", category: "diagnostics", icon: "Waves", tests: [], copyApproved: false,
    summary: "Radiation-free imaging of organs and soft tissue; Doppler studies assess blood flow through vessels." },
  { slug: "dermatology", name: "Dermatology Clinic", legacyName: "Dermatologist", category: "clinics", icon: "Sparkles", tests: [], copyApproved: false,
    summary: "Consultations with a dermatologist for skin, hair and nail conditions." },
  { slug: "diet-nutrition", name: "Diet & Nutrition", legacyName: "Diet & Nutrition", category: "clinics", icon: "Apple", tests: [], copyApproved: false,
    summary: "Personalised dietary guidance for weight management and conditions such as diabetes and high cholesterol." },
  { slug: "telemedicine", name: "Telemedicine", legacyName: "Telemedicine", category: "clinics", icon: "Video", tests: [], copyApproved: false,
    summary: "Remote consultations so patients can speak to a clinician without travelling." },
  { slug: "pharmacy", name: "Pharmacy", legacyName: "Pharmacy", category: "pharmacy", icon: "Pill", tests: [], copyApproved: false,
    summary: "An on-site pharmacy so prescriptions can be filled in the same visit." },
];

/** Services with their imported tests (tests.generated.ts) appended to any listed above. */
export const services: Service[] = serviceList.map((service) => ({
  ...service,
  tests: [...service.tests, ...(generatedTests[service.slug] ?? [])],
}));

/* ------------------------------------------------------------------ */
/* 7. PEOPLE / STATS / TESTIMONIALS — all missing on current site      */
/* ------------------------------------------------------------------ */

export const doctors: Array<{ name: string; title: string; qualifications: string; serviceSlugs: string[]; photo?: string; pmdcNo?: string }> = [];
// TODO(client): roster with PMDC numbers. Section stays hidden while empty.

export const stats: Array<{ label: string; value: number; suffix?: string }> = [];
// Current About page shows counters stuck at "0 K" / "0 M" (broken). Only "9+ years" is derivable
// from foundedYear; compute it, don't hard-code. Do not invent volume numbers.

export const testimonials: Array<{ quote: string; author: string; source: "google" | "direct" }> = [];
// TODO(client): real Google reviews only (with permission). Never fabricate.

/**
 * Patient FAQs. Shown on the home page (with FAQPage structured data) only
 * once this has entries. Answers must be the client's, not ours.
 */
export const faqs: Array<{ question: string; answer: string }> = [];
// TODO(client): common patient questions with approved answers.

/* ------------------------------------------------------------------ */
/* 8. FEATURE FLAGS — UI reads these; nothing half-built ships         */
/* ------------------------------------------------------------------ */

export const features = {
  testDirectory: false, // flip when services[].tests populated with prices (run `pnpm import-tests`)
  homeSampling: false, // TODO(client): do they offer it? which areas, what fee?
  doctorsSection: false, // flips automatically if doctors.length > 0 (see lib)
  statsSection: false,
  testimonials: false,
  reportPortalUrl: null as string | null, // TODO(client): LIS portal URL if one exists
  urduToggle: false, // phase 2
} as const;

/* ------------------------------------------------------------------ */
/* 8a. NAVIGATION: header, mobile drawer and footer, in this order     */
/* ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
  /** Opens the services mega menu on desktop and an accordion on mobile. */
  hasMegaMenu?: boolean;
}

export const navigation: { navItems: NavItem[] } = {
  navItems: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services", hasMegaMenu: true },
    // Linked only once the directory is live, so nothing points at a 404.
    ...(features.testDirectory ? [{ label: "Tests & prices", href: "/tests" }] : []),
    { label: "Reports", href: "/reports" },
    { label: "Locations", href: "/locations" },
    { label: "Contact", href: "/contact" },
  ],
};

/* ------------------------------------------------------------------ */
/* 8b. MEDIA: every photo on the site                                  */
/* ------------------------------------------------------------------ */

/**
 * To swap in a real photo: put it in public/images/real, run `pnpm images`,
 * then change one entry here (kind, src, alt).
 * `src` is the copy in "optimized", never the original. `alt` says what is in
 * the picture; validate.ts fails the build if it is empty or the file is missing.
 */
export interface MediaItem {
  kind: "stock" | "real";
  src: string;
  alt: string;
}

export interface HeroSlide extends MediaItem {
  /** Which side of the photo to keep in view when it is cropped. */
  focal: "right" | "center";
}

export type BannerKey = "about" | "services" | "reports" | "locations" | "contact";

export const media: {
  hero: HeroSlide[];
  /** By service slug. A service with no photo is left out. */
  services: Partial<Record<string, MediaItem>>;
  banners: Record<BannerKey, MediaItem>;
  /** Photos for the About page's own panels (the banner is banners.about). */
  about: { lab: MediaItem };
} = {
  hero: [
    { kind: "stock", src: "/images/stock/optimized/hero-1-lab.jpg", focal: "right", alt: "Gloved hands drawing liquid from a small vial beside a rack of blue-capped test tubes" },
    { kind: "stock", src: "/images/stock/optimized/hero-2-samples.jpg", focal: "center", alt: "Twelve glass test tubes of blue liquid in a wooden rack, seen from above" },
    { kind: "stock", src: "/images/stock/optimized/hero-3-care.jpg", focal: "center", alt: "Hands holding a stethoscope in front of a white coat" },
  ],
  services: {
    haematology: { kind: "stock", src: "/images/stock/optimized/svc-haematology.jpg", alt: "Gloved hand sorting barcoded blood sample tubes in a lab rack" },
    microbiology: { kind: "stock", src: "/images/stock/optimized/svc-microbiology.jpg", alt: "Gloved hands streaking a sample onto a red culture plate" },
    histopathology: { kind: "stock", src: "/images/stock/optimized/svc-histopathology.jpg", alt: "Gloved hand placing a dish under a laboratory microscope" },
    "pcr-lab": { kind: "stock", src: "/images/stock/optimized/svc-pcr.jpg", alt: "Gloved hands pipetting into small sample tubes in a molecular lab" },
    "bone-marrow-aspiration-trephine-biopsy": { kind: "stock", src: "/images/stock/optimized/svc-bone-marrow.jpg", alt: "Gloved hands adjusting a laboratory microscope" },
    ecg: { kind: "stock", src: "/images/stock/optimized/svc-ecg.jpg", alt: "Patient monitor screen showing a green heartbeat trace" },
    "ultrasound-doppler": { kind: "stock", src: "/images/stock/optimized/svc-ultrasound.jpg", alt: "Ultrasound machine with a screen, control panel and scanning probes beside an examination bed" },
    dermatology: { kind: "stock", src: "/images/stock/optimized/svc-dermatology.jpg", alt: "Doctor in a white coat going through a medical history form with a patient" },
    "diet-nutrition": { kind: "stock", src: "/images/stock/optimized/svc-nutrition.jpg", alt: "Dietitian filling in a weekly meal plan with a client, with fresh fruit on the table" },
    telemedicine: { kind: "stock", src: "/images/stock/optimized/svc-telemedicine.jpg", alt: "Doctor typing on a laptop with a stethoscope on the desk" },
    pharmacy: { kind: "stock", src: "/images/stock/optimized/svc-pharmacy.jpg", alt: "Pharmacy shelves stocked with boxes of medicine" },
  },
  banners: {
    about: { kind: "stock", src: "/images/stock/optimized/banner-about.jpg", alt: "Two people working at a laboratory bench with tubing and glass bottles, in black and white" },
    services: { kind: "stock", src: "/images/stock/optimized/banner-services.jpg", alt: "Person in a white coat working at a laboratory bench" },
    reports: { kind: "stock", src: "/images/stock/optimized/banner-reports.jpg", alt: "Laboratory bench with a notebook and racks of labelled sample tubes" },
    locations: { kind: "stock", src: "/images/stock/optimized/banner-locations.jpg", alt: "Faisal Mosque in Islamabad at sunset" },
    contact: { kind: "stock", src: "/images/stock/optimized/banner-contact.jpg", alt: "Reception desk under a lit Reception sign" },
  },
  about: {
    // Same stock photo as hero slide 1 until real photos of the lab arrive.
    lab: { kind: "stock", src: "/images/stock/optimized/hero-1-lab.jpg", alt: "Gloved hands drawing liquid from a small vial beside a rack of blue-capped test tubes" },
  },
};

/* ------------------------------------------------------------------ */
/* 9. BRAND TOKENS (measured from live logo files + theme CSS)         */
/* ------------------------------------------------------------------ */

export const brandTokens = {
  colors: {
    logoBlue: "#0A58A8", // emblem + wordmark sub-text (sampled from logo PNG)
    logoRed: "#E81C24", // "AYYUB LABS & CLINICS" wordmark (sampled from logo PNG)
    navy: "#27477D", // current theme primary: buttons, headings, links (computed CSS)
    surface: "#F3F6F7", // current theme section background (computed CSS)
    tint: "rgba(105,143,208,0.11)", // current theme card tint (computed CSS)
    ink: "#1E2A3A", // body text (ours; replaces theme grey)
    muted: "#5B6472", // ours; theme grey #888C92 fails WCAG AA (3.38:1)
    redText: "#C8151D", // darker red for small text; #E81C24 is 4.18:1 on surface
    whatsapp: "#25D366", // WhatsApp brand green, button only
    paleBlue: "#E3EEFB", // ours; end colour of the homepage CTA band (tint→paleBlue)
  },
  contrast: {
    "logoBlue/white": 7.06,
    "navy/white": 9.2,
    "logoRed/white": 4.54, // AA for large text and UI only
    "redText/white": 5.86,
  },
  font: { family: "Montserrat", source: "next/font/google", weights: [400, 500, 600, 700, 800] },
  logo: {
    emblemPng: "https://ayyublabs.com/wp-content/uploads/2021/09/logo-t.png", // 66x63 — too small
    emblem192: "https://ayyublabs.com/wp-content/uploads/2021/09/cropped-logo-t-192x192.png",
    wordmarkPng: "https://ayyublabs.com/wp-content/uploads/2021/09/newww.png", // 276x84, includes address text
    description:
      "Circular blue emblem: 'AYYUB LABS' arched on top, 'IN QUALITY WE BELIEVE' arched below; centre shows a test tube with red drop, DNA helix and microscope. Wordmark 'AYYUB LABS & CLINICS' in red, bold sans.",
    vectorAvailable: false, // TODO(client): request original AI/SVG/PDF. Otherwise commission a vector redraw.
  },
} as const;

/* ------------------------------------------------------------------ */
/* 10. LEGACY URLS → 301 targets (preserve whatever SEO equity exists) */
/* ------------------------------------------------------------------ */

export const legacyRedirects: Array<{ source: string; destination: string; permanent: boolean }> = [
  { source: "/home-three", destination: "/", permanent: true },
  { source: "/about-us", destination: "/about", permanent: true },
  { source: "/contact-us", destination: "/contact", permanent: true },
  { source: "/online-report", destination: "/reports", permanent: true },
  // /services stays /services
  // Placeholder blog (lorem-ipsum + spam comments) is NOT migrated:
  { source: "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug*", destination: "/", permanent: true },
  { source: "/category/:slug*", destination: "/", permanent: true },
  { source: "/tag/:slug*", destination: "/", permanent: true },
  { source: "/wp-admin/:path*", destination: "/", permanent: false },
];

/* ------------------------------------------------------------------ */
/* 11. OPEN QUESTIONS FOR THE CLIENT (block launch until answered)     */
/* ------------------------------------------------------------------ */

export const openQuestions = [
  "Sunday: closed at both branches?",
  "F-8 Islamabad: own hours, landline and IHRA registration?",
  "PHC / PNRA registration numbers and what the PNRA licence covers.",
  "Do you have lab software (LIS) with an online report portal? URL?",
  "Home sample collection: offered? areas and fee?",
  "Test list with prices (Excel is fine) for the searchable test directory.",
  "Doctors: names, qualifications, PMDC numbers, photos.",
  "Real photos of reception, lab and staff (stock photos undermine trust).",
  "Logo in vector format (AI/SVG/PDF).",
  "Facebook / Instagram / Google Business Profile links.",
  "Who controls the domain registrar and the current hosting (cPanel)? Is info@ayyublabs.com hosted there?",
  "Approve the draft service descriptions and About copy.",
  "Which services are offered at each branch (Saddar vs F-8)? Service pages list both until confirmed.",
  "Report collection: what ID or authorisation do you need from someone collecting on a patient's behalf?",
  "Does each branch have its own email, or is info@ayyublabs.com used for both?",
  "Our story timeline: which year did each branch open, and any other milestones worth listing?",
  "Frequently asked questions with approved answers (shown on the home page)?",
  "Replace before launch: banner-about (black-and-white 1960s photo with identifiable people; reads as our own history), banner-reports (a person's name and another university are readable), banner-contact (another organisation's reception), svc-ecg (patient monitor with a low oxygen reading, not an ECG), svc-pharmacy (readable prescription brands).",
] as const;
