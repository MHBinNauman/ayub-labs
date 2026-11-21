import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { brand, branches, contact, registrations } from "@/data/site-data";
import { primaryPhone, storyTimeline } from "@/lib/site";
import { ContactCTA } from "./ContactCTA";
import { QualityPromise } from "./QualityPromise";
import { RegistrationTiles, type RegistrationTile } from "./RegistrationTiles";
import { StoryTimeline } from "./StoryTimeline";

const tile = (overrides: Partial<RegistrationTile> = {}): RegistrationTile => ({
  id: "sample",
  short: "SMP",
  name: "Sample Authority",
  claim: "Registered",
  explainer: "Sample explainer.",
  logo: "/brand/badges/phc.png",
  covers: ["Sample branch"],
  registrationNo: null,
  ...overrides,
});

describe("storyTimeline", () => {
  it("starts at the founding year and ends with a generated Today entry", () => {
    const entries = storyTimeline();
    expect(entries[0].when).toBe(String(brand.foundedYear.value));
    const today = entries.at(-1)!;
    expect(today.when).toBe("Today");
    expect(today.current).toBe(true);
    expect(today.title).toMatch(new RegExp(`^${branches.length} branch`));
    for (const branch of branches) expect(today.text).toContain(branch.name);
  });
});

describe("StoryTimeline", () => {
  it("renders an ordered list of milestones", () => {
    const html = renderToStaticMarkup(
      createElement(StoryTimeline, { entries: storyTimeline() }),
    );
    expect(html).toContain("<ol");
    expect(html).toContain(String(brand.foundedYear.value));
    expect(html).toContain("Today");
  });

  it("renders nothing without entries", () => {
    expect(
      renderToStaticMarkup(createElement(StoryTimeline, { entries: [] })),
    ).toBe("");
  });
});

describe("RegistrationTiles", () => {
  it("every registration in site-data has a plain-language explainer", () => {
    for (const registration of registrations) {
      expect(registration.explainer.length).toBeGreaterThan(10);
      expect(registration.explainer).not.toMatch(/accredit/i);
    }
  });

  it("shows the claim, explainer and covered branches, never 'accredited'", () => {
    const html = renderToStaticMarkup(
      createElement(RegistrationTiles, { tiles: [tile()] }),
    );
    expect(html).toContain("Registered");
    expect(html).toContain("Sample explainer.");
    expect(html).toContain("Covers: Sample branch");
    expect(html).not.toMatch(/accredit/i);
  });

  it("shows a registration number only when there is one", () => {
    const without = renderToStaticMarkup(
      createElement(RegistrationTiles, { tiles: [tile()] }),
    );
    expect(without).not.toContain("Registration no.");
    const withNo = renderToStaticMarkup(
      createElement(RegistrationTiles, {
        tiles: [tile({ registrationNo: "SAMPLE-1" })],
      }),
    );
    expect(withNo).toContain("Registration no. SAMPLE-1");
  });
});

describe("QualityPromise", () => {
  it("uses the tagline as its heading", () => {
    const html = renderToStaticMarkup(
      createElement(QualityPromise, {
        tagline: "Sample tagline",
        points: [{ id: "reliable", title: "Sample", text: "Sample text." }],
      }),
    );
    expect(html).toContain("Sample tagline");
    expect(html).toContain("Sample text.");
  });
});

describe("ContactCTA", () => {
  it("links to call, WhatsApp and the branch finder", () => {
    const html = renderToStaticMarkup(createElement(ContactCTA));
    expect(html).toContain(`href="tel:${primaryPhone.e164}"`);
    expect(html).toContain(`https://wa.me/${contact.whatsapp.number}`);
    expect(html).toContain('href="/locations"');
  });
});
