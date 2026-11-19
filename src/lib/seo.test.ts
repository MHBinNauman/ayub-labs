import { describe, expect, it } from "vitest";
import { brand, branches, services, type Branch } from "@/data/site-data";
import {
  absoluteUrl,
  branchJsonLd,
  breadcrumbJsonLd,
  serializeJsonLd,
  serviceJsonLd,
} from "./seo";

const bySlug = (slug: string) => {
  const service = services.find((s) => s.slug === slug);
  if (!service) throw new Error(`no service ${slug}`);
  return service;
};

describe("serializeJsonLd", () => {
  it("escapes < so a value cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)");
  });
});

describe("absoluteUrl", () => {
  it("builds on the site domain", () => {
    expect(absoluteUrl("/services/ecg")).toBe(
      `https://${brand.domain}/services/ecg`,
    );
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers items from 1 with absolute URLs", () => {
    const data = breadcrumbJsonLd([
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
    ]) as { itemListElement: { position: number; item: string }[] };
    expect(data.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(data.itemListElement[1].item).toBe(
      `https://${brand.domain}/services`,
    );
  });
});

describe("serviceJsonLd", () => {
  it.each([
    ["haematology", "BloodTest"],
    ["microbiology", "PathologyTest"],
    ["ecg", "MedicalTest"],
    ["pcr-lab", "MedicalTest"],
    ["ultrasound-doppler", "ImagingTest"],
    ["bone-marrow-aspiration-trephine-biopsy", "MedicalProcedure"],
  ])("types %s as %s", (slug, type) => {
    expect(serviceJsonLd(bySlug(slug))?.["@type"]).toBe(type);
  });

  it("gives clinics and the pharmacy no test or procedure type", () => {
    for (const service of services) {
      if (service.category === "clinics" || service.category === "pharmacy") {
        expect(serviceJsonLd(service)).toBeNull();
      }
    }
  });

  it("adds the old site's name only when it differs", () => {
    expect(serviceJsonLd(bySlug("ecg"))).not.toHaveProperty("alternateName");
    expect(serviceJsonLd(bySlug("ultrasound-doppler"))?.alternateName).toBe(
      "Ultrasound/Doppler",
    );
  });

  it("restates page facts only", () => {
    const data = serviceJsonLd(bySlug("ecg"));
    expect(Object.keys(data ?? {}).sort()).toEqual(
      ["@context", "@type", "description", "name", "url"].sort(),
    );
  });
});

describe("branchJsonLd", () => {
  // Fixtures derived from a real branch, so each rule is tested in isolation.
  const base: Branch = {
    ...branches[0],
    geo: undefined,
    googleMapsUrl: undefined,
  };
  const tenToNine = { open: "10:00", close: "21:00" };
  const fixture: Branch = {
    ...base,
    hoursVerified: true,
    hours: {
      mon: tenToNine,
      tue: tenToNine,
      wed: tenToNine,
      thu: tenToNine,
      fri: { open: "14:00", close: "21:00" },
      sat: tenToNine,
      sun: null,
    },
  };

  it("is a MedicalBusiness and DiagnosticLab with a postal address", () => {
    const data = branchJsonLd(fixture);
    expect(data["@type"]).toEqual(["MedicalBusiness", "DiagnosticLab"]);
    expect(data.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: fixture.city,
      addressCountry: "PK",
    });
    expect(data.url).toBe(absoluteUrl(`/locations/${fixture.id}`));
  });

  it("groups days with identical hours and skips closed days", () => {
    expect(branchJsonLd(fixture).openingHoursSpecification).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"],
        opens: "10:00",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday"],
        opens: "14:00",
        closes: "21:00",
      },
    ]);
  });

  it("omits opening hours that are not verified", () => {
    expect(
      branchJsonLd({ ...fixture, hoursVerified: false }),
    ).not.toHaveProperty("openingHoursSpecification");
  });

  it("adds geo and a map link only when site-data has them", () => {
    expect(branchJsonLd(fixture)).not.toHaveProperty("geo");
    expect(branchJsonLd(fixture)).not.toHaveProperty("hasMap");
    const located = branchJsonLd({
      ...fixture,
      geo: { lat: 33.6, lng: 73.05 },
      googleMapsUrl: "https://maps.example.com/branch",
    });
    expect(located.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 33.6,
      longitude: 73.05,
    });
    expect(located.hasMap).toBe("https://maps.example.com/branch");
  });

  it("matches the real data's verification status", () => {
    for (const branch of branches) {
      expect("openingHoursSpecification" in branchJsonLd(branch)).toBe(
        branch.hoursVerified,
      );
    }
  });
});
