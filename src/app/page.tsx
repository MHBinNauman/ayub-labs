import type { Metadata } from "next";
import {
  DoctorsSection,
  Hero,
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
  stats,
  testimonials,
} from "@/data/site-data";
import {
  cities,
  joinList,
  offeringPhrase,
  registeredWithShort,
  resolvedFeatures,
  verifiedRegistrations,
} from "@/lib/site";

const offering = offeringPhrase(["laboratory", "diagnostics", "clinics"]);

export const metadata: Metadata = {
  title: {
    absolute: `${brand.displayName} | Diagnostic Lab in ${joinList(cities, "&")}`,
  },
  description: [
    `${offering[0].toUpperCase()}${offering.slice(1)} in ${joinList(branches.map((b) => b.name))}.`,
    `Serving patients since ${brand.foundedYear.value}.`,
    verifiedRegistrations.length > 0
      ? `Registered with ${registeredWithShort}.`
      : null,
  ]
    .filter(Boolean)
    .join(" "),
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickActions />
      <ServicesShowcase />
      {resolvedFeatures.statsSection && <StatsSection stats={stats} />}
      <WhyAyyub />
      {resolvedFeatures.doctorsSection && <DoctorsSection doctors={doctors} />}
      <LocationsPreview />
      {resolvedFeatures.testimonials && (
        <TestimonialsSection testimonials={testimonials} />
      )}
      <ReportCTA />
    </>
  );
}
