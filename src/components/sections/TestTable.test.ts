/**
 * No service has tests yet, so the table never renders on the site today.
 * These render it with sample data (defined only here) so it is known to
 * work the day the client supplies a price list.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { TestItem } from "@/data/site-data";
import { formatPKR } from "@/lib/site";
import { TestTable } from "./TestTable";

const render = (tests: TestItem[]) =>
  renderToStaticMarkup(
    createElement(TestTable, { tests, serviceName: "Sample service" }),
  );

describe("TestTable", () => {
  it("renders nothing without tests", () => {
    expect(render([])).toBe("");
  });

  it("shows only columns that some test fills", () => {
    const html = render([{ name: "Sample A", pricePKR: 1500 }]);
    expect(html).toContain('<th scope="col"');
    expect(html).toContain("Price");
    expect(html).not.toContain("Sample</th>");
    expect(html).not.toContain("Fasting");
    expect(html).toContain(formatPKR(1500));
  });

  it("marks gaps as not listed and formats fasting", () => {
    const html = render([
      { name: "Sample A", fasting: true, pricePKR: 900 },
      { name: "Sample B", fasting: false },
    ]);
    expect(html).toContain("Yes");
    expect(html).toContain("No");
    expect(html).toContain("Not listed");
  });

  it("lists other names a patient might search for", () => {
    const html = render([{ name: "Sample A", aka: ["Alias 1", "Alias 2"] }]);
    expect(html).toContain("Also called Alias 1, Alias 2");
  });

  it("is a keyboard-scrollable, labelled region with a caption", () => {
    const html = render([{ name: "Sample A" }]);
    expect(html).toContain('role="region"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("<caption");
  });
});
