import { expect, test, type Page } from "@playwright/test";
import { branches, contact, policies } from "../src/data/site-data";
import {
  captureWindowOpen,
  openedUrls,
  recordRequests,
  waText,
} from "./composers";

const [saddar] = branches;
const form = (page: Page) =>
  page.getByRole("form", { name: "Request your report on WhatsApp" });
const submit = (page: Page) =>
  form(page).getByRole("button", { name: /Request on WhatsApp/ });

test.describe("/reports", () => {
  test.beforeEach(async ({ page }) => {
    await captureWindowOpen(page);
    await page.goto("/reports");
    await page.locator("main form[data-hydrated]").waitFor();
  });

  test("page structure", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Your test report",
    );
    await expect(
      page.getByRole("heading", { name: "Collect in person" }),
    ).toBeVisible();
    for (const branch of branches) {
      await expect(
        page
          .getByRole("main")
          .getByRole("heading", { level: 3, name: branch.name }),
      ).toBeVisible();
    }
    await expect(page.getByText(policies.reportRelease.value)).toBeVisible();
  });

  test("shared report band with three steps jumps to the form", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { level: 2, name: "Access your reports" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("list", { name: "How to get your report" })
        .getByRole("listitem"),
    ).toHaveCount(3);
    const jump = page.getByRole("link", { name: "Request your report" });
    await expect(jump).toHaveAttribute("href", "#request-form");
    await jump.click();
    await expect(form(page)).toBeInViewport();
  });

  test("empty submit shows every error and focuses the first field", async ({
    page,
  }) => {
    await submit(page).click();
    await expect(form(page).getByLabel("Patient name")).toBeFocused();
    await expect(form(page).locator('[aria-invalid="true"]')).toHaveCount(4);
    expect(await openedUrls(page)).toHaveLength(0);
  });

  test("a bad phone number is the only error", async ({ page }) => {
    const f = form(page);
    await f.getByLabel("Patient name").fill("Ayesha Khan");
    await f.getByLabel("Receipt / Lab No.").fill("AL-1042");
    await f.getByLabel("Branch").selectOption(saddar.id);
    await f.getByLabel("Phone").fill("12345");
    await submit(page).click();
    await expect(f.locator('[aria-invalid="true"]')).toHaveCount(1);
    await expect(f.getByLabel("Phone")).toBeFocused();
    await expect(f.getByText(/Pakistani number/)).toBeVisible();
  });

  test("a valid request opens WhatsApp with the structured message and nothing else leaves the page", async ({
    page,
  }) => {
    const requests = recordRequests(page);
    const f = form(page);
    await f.getByLabel("Patient name").fill("Ayesha Zzqx");
    await f.getByLabel("Receipt / Lab No.").fill("AL-1042");
    await f.getByLabel("Branch").selectOption(saddar.id);
    await f.getByLabel("Phone").fill("0300-1234567");
    await submit(page).click();

    const opened = await openedUrls(page);
    expect(opened).toHaveLength(1);
    const url = new URL(opened[0].url);
    expect(`${url.origin}${url.pathname}`).toBe(
      `https://wa.me/${saddar.whatsapp ?? contact.whatsapp.number}`,
    );
    expect(waText(opened[0].url)).toBe(
      `Report request\nName: Ayesha Zzqx\nLab No: AL-1042\nBranch: ${saddar.name}\nPhone: 0300-1234567`,
    );
    expect(opened[0].features).toContain("noopener");

    expect(new URL(page.url()).search).toBe("");
    expect(requests.filter((line) => /Zzqx|AL-1042/.test(line))).toEqual([]);
  });
});

test.describe("/reports without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("offers a plain WhatsApp link", async ({ page }) => {
    await page.goto("/reports");
    await expect(
      page.getByRole("link", { name: "Message us on WhatsApp" }),
    ).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  });
});
