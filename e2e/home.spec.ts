import { expect, test, type Page } from "@playwright/test";
import { brand, branches, media, services } from "../src/data/site-data";
import {
  keepHyphens,
  reportSteps,
  whyChooseItems,
  yearsServing,
} from "../src/lib/site";
import { SPLASH_KEY } from "../src/lib/splash";

test("home page has the SEO title and hero heading", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(
    `${brand.displayName} | Diagnostic Lab in Rawalpindi & Islamabad`,
  );
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText("Reliable diagnostics.");
  await expect(h1).toContainText("In quality we believe.");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /since 2016/,
  );
});

test("hidden sections stay hidden while their data is empty", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Doctors" })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "What patients say" }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Key figures")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/TODO|Lorem|0 ?K\b/);
});

test("status chip goes live after hydration", async ({ page }) => {
  // Tuesday 1:00 PM in Karachi: open.
  await page.clock.setFixedTime(new Date("2026-11-17T08:00:00Z"));
  await page.goto("/");
  const hero = page.locator("section", { has: page.locator("#hero-heading") });
  await expect(hero.getByText("Open now · closes 9:00 PM")).toBeVisible();
});

test("services tabs filter the grid", async ({ page }) => {
  await page.goto("/");
  const tabs = page.getByRole("tablist", { name: "Service categories" });
  // The locations card has a tab panel too.
  const panel = page
    .locator("section", { has: page.locator("#services-heading") })
    .getByRole("tabpanel");
  await expect(panel.getByRole("listitem")).toHaveCount(services.length);

  await tabs.getByRole("tab", { name: /Diagnostics/ }).click();
  const diagnostics = services.filter((s) => s.category === "diagnostics");
  await expect(panel.getByRole("listitem")).toHaveCount(diagnostics.length);
  await expect(tabs.getByRole("tab", { name: /Diagnostics/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  // Arrow keys move selection, roving tabindex.
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: /Clinics/ })).toBeFocused();
});

test("the locations card switches branch, with directions and call for each", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("section", {
    has: page.locator("#locations-heading"),
  });
  const tabs = section.getByRole("tablist", { name: "Branches" });
  for (const branch of branches) {
    await tabs.getByRole("tab", { name: branch.name }).click();
    await expect(tabs.getByRole("tab", { name: branch.name })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(
      section.getByRole("link", { name: `Directions to ${branch.name}` }),
    ).toBeVisible();
    await expect(
      section.getByRole("link", { name: `Call ${branch.name}` }),
    ).toBeVisible();
    // The other branches' panels have faded out of view and the a11y tree.
    for (const other of branches.filter((b) => b.id !== branch.id)) {
      await expect(
        section.getByRole("link", { name: `Call ${other.name}` }),
      ).toBeHidden();
    }
  }
});

test("section order below the hero", async ({ page }) => {
  await page.goto("/");
  const headings = await page
    .locator("main h2")
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(headings).toEqual([
    "services-heading",
    "about-heading",
    "why-heading",
    "report-heading",
    "locations-heading",
    "home-cta-heading",
  ]);
});

test("service cards show a photo for each service that has one", async ({
  page,
}) => {
  await page.goto("/");
  // The locations card has a tab panel too.
  const panel = page
    .locator("section", { has: page.locator("#services-heading") })
    .getByRole("tabpanel");
  for (const service of services) {
    const card = panel.getByRole("listitem").filter({
      has: page.getByRole("link", { name: service.name, exact: true }),
    });
    const photo = media.services[service.slug];
    await expect(card.locator("img")).toHaveCount(photo ? 1 : 0);
    if (photo) {
      await expect(card.locator("img")).toHaveAttribute("alt", photo.alt);
    }
  }
});

test("about teaser: story link and a checklist of facts", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section", {
    has: page.locator("#about-heading"),
  });
  await expect(section.getByText(brand.aboutDraft)).toBeVisible();
  await expect(
    section.getByText(String(brand.foundedYear.value), { exact: true }),
  ).toBeVisible();
  await expect(
    section.getByRole("link", { name: "Read our story" }),
  ).toHaveAttribute("href", "/about");
  const checklist = section.getByRole("list");
  await expect(checklist.getByRole("listitem")).toHaveText(
    whyChooseItems.map(keepHyphens),
  );
  await expect(section).not.toContainText(/accredit/i);
});

test("reports band with three steps in order", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section", {
    has: page.locator("#report-heading"),
  });
  await expect(
    section.getByRole("heading", { name: "Access your reports" }),
  ).toBeVisible();
  await expect(
    section
      .getByRole("list", { name: "How to get your report" })
      .getByRole("listitem"),
  ).toContainText(reportSteps); // each item also shows its step number
});

test("closing band offers WhatsApp and a call", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section", {
    has: page.locator("#home-cta-heading"),
  });
  await expect(
    section.getByRole("heading", { name: "Have a question about a test?" }),
  ).toBeVisible();
  await expect(
    section.getByRole("link", { name: "WhatsApp us" }),
  ).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  await expect(section.getByRole("link", { name: /^Call / })).toHaveAttribute(
    "href",
    /^tel:\+92/,
  );
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`years figure ends on its final value (${reducedMotion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    const section = page.locator("section", {
      has: page.locator("#why-heading"),
    });
    await section.scrollIntoViewIfNeeded();
    const years = yearsServing()!;
    // Screen readers hear only the final label; the counting copy is aria-hidden.
    const heading = section.getByRole("heading", {
      level: 3,
      name: years.label,
    });
    await expect(heading).toBeVisible();
    // Once the count has run, the visible number has landed on the final value too.
    await expect(heading.locator("[aria-hidden]")).toHaveText(years.label);
  });
}

test.describe("maps", () => {
  test("phones load a map only on request", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    await expect(page.locator("iframe")).toHaveCount(0);
    await page
      .getByRole("button", { name: new RegExp(branches[0].name) })
      .click();
    await expect(
      page.locator(`iframe[title="Map of ${branches[0].name}"]`),
    ).toHaveAttribute("loading", "lazy");
  });

  test("desktop renders lazy iframes directly", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("/");
    await expect(page.locator('iframe[loading="lazy"]')).toHaveCount(
      branches.length,
    );
  });
});

test.describe("hero slider", () => {
  /** The splash would sit over the hero; these tests are about the hero. */
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      sessionStorage.setItem(key, "1");
    }, SPLASH_KEY);
  });

  const slider = (page: Page) =>
    page.getByRole("group", { name: "Photos of our lab" });

  /** Where each hero photo's request started, relative to the load event. */
  async function photoTimings(page: Page) {
    return page.evaluate(
      (srcs) => {
        const [nav] = performance.getEntriesByType(
          "navigation",
        ) as PerformanceNavigationTiming[];
        const resources = performance.getEntriesByType("resource");
        return srcs.map((src) => {
          const entry = resources.find((r) =>
            r.name.includes(encodeURIComponent(src)),
          );
          return entry ? entry.startTime - nav.loadEventStart : null;
        });
      },
      media.hero.map((slide) => slide.src),
    );
  }

  test("slide 1 is the LCP element", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const lcp = await page.evaluate(
      () =>
        new Promise<string | null>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries() as Array<
              PerformanceEntry & { element: Element | null }
            >;
            const element = entries.at(-1)?.element;
            resolve(
              element?.closest("[data-slide]")?.getAttribute("data-slide") ??
                element?.tagName ??
                null,
            );
          }).observe({ type: "largest-contentful-paint", buffered: true });
        }),
    );
    expect(lcp).toBe("0");
  });

  test("slides 2 and 3 load only after the load event", async ({ page }) => {
    await page.goto("/");
    await expect(slider(page).locator("img")).toHaveCount(3);
    await expect
      .poll(async () => (await photoTimings(page)).every((t) => t !== null))
      .toBe(true);
    const [first, second, third] = (await photoTimings(page)) as number[];
    expect(first).toBeLessThan(0);
    expect(second).toBeGreaterThanOrEqual(0);
    expect(third).toBeGreaterThanOrEqual(0);
  });

  test("dots choose a slide and the toggle pauses the show", async ({
    page,
  }) => {
    await page.goto("/");
    const group = slider(page);
    await expect(group).toHaveAttribute("data-hydrated", "true");

    await group.getByRole("button", { name: "Show slide 2" }).click();
    await expect(
      group.getByRole("button", { name: "Show slide 2" }),
    ).toHaveAttribute("aria-current", "true");
    await expect(group.locator('[data-slide="1"]')).toHaveAttribute(
      "data-state",
      "active",
    );

    await group.getByRole("button", { name: "Pause slideshow" }).click();
    await expect(
      group.getByRole("button", { name: "Play slideshow" }),
    ).toBeVisible();
    await expect(group).toHaveAttribute("data-paused", "");
  });

  test("hovering the photos pauses the show", async ({ page, isMobile }) => {
    test.skip(isMobile, "no hover on touch screens");
    await page.goto("/");
    const group = slider(page);
    await expect(group).toHaveAttribute("data-hydrated", "true");
    await expect(group).not.toHaveAttribute("data-paused");
    const box = (await group.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
    await expect(group).toHaveAttribute("data-paused", "");
  });

  test("reduced motion keeps slide 1 still, with no controls", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("load");
    const group = slider(page);
    await expect(group).toHaveAttribute("data-hydrated", "true");
    await page.waitForTimeout(500); // past requestIdleCallback
    await expect(group.locator("img")).toHaveCount(1);
    await expect(
      group.getByRole("button", { name: "Pause slideshow" }),
    ).toBeHidden();
  });

  test.describe("on a 375×667 phone", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("CTAs fit on the first screen, clear of the WhatsApp button", async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, "phone layout");
      await page.goto("/");
      const hero = page.locator("[data-hero]");
      const ctas = [
        hero.getByRole("link", { name: "WhatsApp us" }),
        hero.getByRole("link", { name: "Call now" }),
        hero.getByRole("link", { name: "Get your report" }),
      ];
      const fab = (await page
        .getByRole("link", { name: "Chat on WhatsApp" })
        .boundingBox())!;
      const controls = (await slider(page)
        .getByRole("button", { name: "Pause slideshow" })
        .boundingBox())!;
      type Box = typeof fab;
      const overlaps = (a: Box, b: Box) =>
        a.x < b.x + b.width &&
        b.x < a.x + a.width &&
        a.y < b.y + b.height &&
        b.y < a.y + a.height;

      for (const cta of ctas) {
        const box = (await cta.boundingBox())!;
        expect(box.y + box.height).toBeLessThanOrEqual(667);
        expect(overlaps(box, fab)).toBe(false);
        expect(overlaps(box, controls)).toBe(false);
      }
    });
  });
});
