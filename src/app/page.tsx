import type { Metadata } from "next";
import { FaqSection } from "@/components/sections/FaqSection";
import { homeTitle } from "@/lib/page-titles";
import { pageMetadata } from "@/lib/seo";
import {
  AboutTeaser,
  DoctorsSection,
  Hero,
  HomeCTA,
  LocationsPreview,
  QuickActions,
  ReportCTA,
  ServicesShowcase,
  StatsSection,
  TestimonialsSection,
  WhyAyyub,
} from "@/components/sections";
import {
  brand,
  branches,
  doctors,
  faqs,
  stats,
  testimonials,
} from "@/data/site-data";
import {
  joinList,
  offeringPhrase,
  registeredWithShort,
  resolvedFeatures,
  verifiedRegistrations,
} from "@/lib/site";

const offering = offeringPhrase(["laboratory", "diagnostics", "clinics"]);

export const metadata: Metadata = pageMetadata({
  title: homeTitle,
  absoluteTitle: true,
  path: "/",
  description: [
    `${offering[0].toUpperCase()}${offering.slice(1)} in ${joinList(branches.map((b) => b.name))}.`,
    `Serving patients since ${brand.foundedYear.value}.`,
    verifiedRegistrations.length > 0
      ? `Registered with ${registeredWithShort}.`
      : null,
  ]
    .filter(Boolean)
    .join(" "),
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickActions />
      <ServicesShowcase />
      <AboutTeaser />
      <WhyAyyub />
      {resolvedFeatures.statsSection && <StatsSection stats={stats} />}
      <ReportCTA />
      {resolvedFeatures.doctorsSection && <DoctorsSection doctors={doctors} />}
      <LocationsPreview />
      <FaqSection faqs={faqs} />
      {resolvedFeatures.testimonials && (
        <TestimonialsSection testimonials={testimonials} />
      )}
      <HomeCTA />
    </>
  );
}
