/**
 * The directory is switched off until the client's price list is imported,
 * so these render it with the dummy fixture (defined only for tests).
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { fixtureTests } from "@/data/tests.fixture";
import { formatPKR } from "@/lib/format-price";
import { QUERY_TOKEN } from "@/lib/message-template";
import { TestDirectory, type TestDirectoryProps } from "./TestDirectory";

const render = (overrides: Partial<TestDirectoryProps> = {}) =>
  renderToStaticMarkup(
    createElement(TestDirectory, {
      tests: fixtureTests,
      services: [
        { slug: "haematology", name: "Haematology" },
        { slug: "microbiology", name: "Microbiology" },
        { slug: "pcr-lab", name: "PCR Lab" },
      ],
      homeSampling: false,
      whatsappNumber: "920000000000",
      bookTemplate: `Book ${QUERY_TOKEN} please`,
      askTemplate: `Ask ${QUERY_TOKEN}`,
      ...overrides,
    }),
  );

describe("TestDirectory", () => {
  it("renders every test with its price", () => {
    const html = render();
    for (const test of fixtureTests) expect(html).toContain(test.name);
    expect(html).toContain(formatPKR(900));
    expect(html).toContain("5 tests");
  });

  it("prefills the WhatsApp booking with the test name", () => {
    const html = render();
    const text = encodeURIComponent("Book Complete Blood Count please");
    expect(html).toContain(`https://wa.me/920000000000?text=${text}`);
    expect(html).toContain("Book via WhatsApp");
  });

  it("shows no price for a test without one", () => {
    const html = render({ tests: [fixtureTests[4]] });
    expect(html).not.toContain("Price:");
  });

  it("has labelled search, category, fasting and sort controls", () => {
    const html = render();
    expect(html).toContain('type="search"');
    for (const label of ["Search tests", "Category", "Fasting", "Sort by"]) {
      expect(html).toContain(`>${label}</label>`);
    }
  });

  it("hides the home-sampling filter and chips unless the service is on", () => {
    expect(render()).not.toContain("Home sampling");
    const html = render({ homeSampling: true });
    expect(html).toContain("Home sampling available");
    expect(html).toContain(">Home sampling</li>");
  });

  it("hides the category filter when only one service has tests", () => {
    const html = render({
      services: [{ slug: "haematology", name: "Haematology" }],
    });
    expect(html).not.toContain(">Category</label>");
  });
});
