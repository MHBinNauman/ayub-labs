import { describe, expect, it } from "vitest";
import { brand, services } from "@/data/site-data";
import {
  absoluteUrl,
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
