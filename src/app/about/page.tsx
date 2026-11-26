import type { Metadata } from "next";
import { pageTitles } from "@/lib/page-titles";
import { AboutSplit } from "@/components/sections/AboutTeaser";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { DoctorsSection } from "@/components/sections/DoctorsSection";
import { QualityPromise } from "@/components/sections/QualityPromise";
import {
  RegistrationTiles,
  type RegistrationTile,
} from "@/components/sections/RegistrationTiles";
import { StoryTimeline } from "@/components/sections/StoryTimeline";
import { PageBanner } from "@/components/ui";
import { brand, doctors, media, qualityPromise } from "@/data/site-data";
import { routes } from "@/lib/nav";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import {
  branchNames,
  cities,
  joinList,
  resolvedFeatures,
  storyTimeline,
  verifiedRegistrations,
  whyChooseItems,
} from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: pageTitles.about,
  description: brand.aboutDraft,
  path: routes.about,
});

const crumbs = [
  { label: "Home", href: "/" },
  { label: "About", href: routes.about },
];

const tiles: RegistrationTile[] = verifiedRegistrations.map((registration) => ({
  id: registration.id,
  short: registration.short,
  name: registration.name,
  claim: registration.claim,
  explainer: registration.explainer,
  logo: registration.logo,
  covers: branchNames(registration.appliesTo),
  registrationNo: registration.registrationNo,
}));

const promise = qualityPromise.filter((point) => point.verified);

/** The banner's one line, from facts in site-data.ts. */
const intro = brand.foundedYear.verified
  ? `Serving patients in ${joinList(cities)} since ${brand.foundedYear.value}.`
  : `Serving patients in ${joinList(cities)}.`;

/**
 * The About copy (brand.aboutDraft) is our rewrite and awaits client
 * approval. Visible only under `next dev`; compiled out of production builds.
 */
function DraftCopyNotice() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <p
      role="note"
      className="mt-4 max-w-2xl rounded-md border-l-4 border-brand-red bg-surface px-4 py-2 text-sm text-ink"
    >
      <strong className="text-brand-red-text">Draft copy.</strong> The client
      has not approved this introduction yet. (Shown in development only.)
    </p>
  );
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageBanner
        crumbs={[crumbs[0], { label: crumbs[1].label }]}
        title={`About ${brand.displayName}`}
        intro={intro}
        media={media.banners.about}
      />

      <AboutSplit
        headingId="lab-heading"
        eyebrow="About us"
        title="Our lab"
        photo={media.about.lab}
        body={brand.aboutDraft}
        note={<DraftCopyNotice />}
        checklistTitle="Why choose us"
        items={whyChooseItems}
      />
      <StoryTimeline entries={storyTimeline()} />
      <RegistrationTiles tiles={tiles} />
      <QualityPromise tagline={brand.tagline.value} points={promise} />
      {resolvedFeatures.doctorsSection && <DoctorsSection doctors={doctors} />}
      <ContactCTA />
    </>
  );
}
