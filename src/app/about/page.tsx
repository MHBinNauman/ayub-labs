import type { Metadata } from "next";
import { pageTitles } from "@/lib/page-titles";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { DoctorsSection } from "@/components/sections/DoctorsSection";
import { QualityPromise } from "@/components/sections/QualityPromise";
import {
  RegistrationTiles,
  type RegistrationTile,
} from "@/components/sections/RegistrationTiles";
import { StoryTimeline } from "@/components/sections/StoryTimeline";
import { Breadcrumbs, Container } from "@/components/ui";
import { brand, doctors, qualityPromise } from "@/data/site-data";
import { routes } from "@/lib/nav";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import {
  branchNames,
  resolvedFeatures,
  storyTimeline,
  verifiedRegistrations,
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

/**
 * The About copy (brand.aboutDraft) is our rewrite and awaits client
 * approval. Visible only under `next dev`; compiled out of production builds.
 */
function DraftCopyNotice() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <p
      role="note"
      className="mt-4 max-w-2xl rounded-md border-l-4 border-brand-red bg-white px-4 py-2 text-sm text-ink"
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
      <section className="bg-surface py-8 sm:py-10">
        <Container>
          <Breadcrumbs items={[crumbs[0], { label: crumbs[1].label }]} />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-balance text-navy sm:text-4xl">
            About {brand.displayName}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-pretty text-ink">
            {brand.aboutDraft}
          </p>
          <DraftCopyNotice />
        </Container>
      </section>

      <StoryTimeline entries={storyTimeline()} />
      <RegistrationTiles tiles={tiles} />
      <QualityPromise tagline={brand.tagline.value} points={promise} />
      {resolvedFeatures.doctorsSection && <DoctorsSection doctors={doctors} />}
      <ContactCTA />
    </>
  );
}
