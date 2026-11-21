import { describe, expect, it } from "vitest";
import { branches, brand, services } from "@/data/site-data";
import { resolvedFeatures } from "@/lib/site";
import robots from "./robots";
import sitemap from "./sitemap";

const origin = `https://${brand.domain}`;

describe("sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);

  it("lists every public page once, with absolute URLs", () => {
    expect(urls).toContain(`${origin}/`);
    for (const service of services) {
      expect(urls).toContain(`${origin}/services/${service.slug}`);
    }
    for (const branch of branches) {
      expect(urls).toContain(`${origin}/locations/${branch.id}`);
    }
    for (const path of ["/about", "/contact", "/reports", "/locations"]) {
      expect(urls).toContain(`${origin}${path}`);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("never lists the styleguide; lists /tests only when switched on", () => {
    expect(urls).not.toContain(`${origin}/styleguide`);
    expect(urls.includes(`${origin}/tests`)).toBe(
      resolvedFeatures.testDirectory,
    );
  });
});

describe("robots", () => {
  const { rules, sitemap: sitemapUrl } = robots();
  const disallow = (Array.isArray(rules) ? rules[0] : rules).disallow as
    string[] | undefined;

  it("blocks the styleguide, and /tests while it is switched off", () => {
    expect(disallow).toContain("/styleguide");
    expect(disallow?.includes("/tests")).toBe(!resolvedFeatures.testDirectory);
  });

  it("points at the sitemap", () => {
    expect(sitemapUrl).toBe(`${origin}/sitemap.xml`);
  });
});
