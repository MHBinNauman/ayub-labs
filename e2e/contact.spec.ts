import { expect, test, type Page } from "@playwright/test";
import { branches, contact } from "../src/data/site-data";
import {
  captureWindowOpen,
  openedUrls,
  recordRequests,
  waText,
} from "./composers";

const [saddar, f8] = branches;
const form = (page: Page) =>
  page.getByRole("form", { name: "General enquiry" });
const send = (page: Page) =>
  form(page).getByRole("button", { name: /Send on WhatsApp/ });

test.describe("/contact", () => {
  test.beforeEach(async ({ page }) => {
    await captureWindowOpen(page);
    await page.route("https://www.google.com/maps**", (route) =>
      route.fulfill({ contentType: "text/html", body: "<html></html>" }),
    );
    await page.goto("/contact");
    await page.locator("main form[data-hydrated]").waitFor();
  });

  test("branch tabs show contact details, and arrow keys switch tabs", async ({
    page,
  }) => {
    const tabs = page.getByRole("tablist", { name: "Branches" });
    const first = tabs.getByRole("tab", { name: saddar.name });
    await expect(first).toHaveAttribute("aria-selected", "true");

    const panel = page.getByRole("tabpanel");
    await expect(
      panel.locator(`a[href="tel:${saddar.phones[0]}"]`),
    ).toBeVisible();
    await expect(
      panel.locator(`a[href="mailto:${contact.email.value}"]`),
    ).toBeVisible();
    await expect(panel.getByRole("table")).toBeVisible();

    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: f8.name })).toBeFocused();
    await expect(page.getByRole("tabpanel")).toContainText(f8.addressLines[0]);
  });

  test("no map loads until asked for", async ({ page }) => {
    await expect(page.locator("iframe")).toHaveCount(0);
    await page
      .getByRole("tabpanel")
      .getByRole("button", { name: /Show map/ })
      .click();
    await expect(page.locator("iframe")).toHaveCount(1);
  });

  test("enquiry validates, then opens WhatsApp; the email link follows the draft", async ({
    page,
  }) => {
    const requests = recordRequests(page);
    const f = form(page);
    await send(page).click();
    await expect(f.getByLabel("Your name")).toBeFocused();
    await expect(f.locator('[aria-invalid="true"]')).toHaveCount(3);

    await f.getByLabel("Your name").fill("Bilal Qqzx");
    await f.getByLabel("Purpose").selectOption("appointment");
    await f.getByLabel("Message").fill("Is Saturday morning free?");

    const href =
      (await f.getByRole("link", { name: /Write to/ }).getAttribute("href")) ??
      "";
    const mail = new URL(href);
    expect(mail.protocol).toBe("mailto:");
    expect(mail.searchParams.get("subject")).toBe(
      "Website enquiry: Appointment",
    );
    expect(mail.searchParams.get("body")).toContain(
      "Is Saturday morning free?",
    );

    await send(page).click();
    const opened = await openedUrls(page);
    expect(opened).toHaveLength(1);
    expect(opened[0].url).toContain(`https://wa.me/${contact.whatsapp.number}`);
    expect(waText(opened[0].url)).toBe(
      "Website enquiry: Appointment\nName: Bilal Qqzx\nPurpose: Appointment\n\nIs Saturday morning free?",
    );

    expect(new URL(page.url()).search).toBe("");
    expect(requests.filter((line) => /Qqzx|Saturday/.test(line))).toEqual([]);
  });
});

test.describe("/contact without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("details render and a plain WhatsApp link is offered", async ({
    page,
  }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Contact us",
    );
    await expect(
      page.getByRole("link", { name: "Message us on WhatsApp" }),
    ).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  });
});
