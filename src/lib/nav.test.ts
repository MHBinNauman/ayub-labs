import { describe, expect, it } from "vitest";
import { features, navigation, services } from "@/data/site-data";
import { ariaCurrent, isActivePath, routes, serviceMenu } from "./nav";
import { serviceIcon } from "./service-icons";

describe("isActivePath", () => {
  it("matches home only on the home page", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/services", "/")).toBe(false);
  });

  it("matches a section and its sub-pages", () => {
    expect(isActivePath("/services", "/services")).toBe(true);
    expect(isActivePath("/services/", "/services")).toBe(true);
    expect(isActivePath("/services/ecg", "/services")).toBe(true);
    expect(isActivePath("/locations", "/locations")).toBe(true);
    expect(isActivePath("/locations/f8-islamabad", "/locations")).toBe(true);
  });

  it("does not match a different path that shares a prefix", () => {
    expect(isActivePath("/servicesx", "/services")).toBe(false);
    expect(isActivePath("/reports", "/services")).toBe(false);
    expect(isActivePath("/services/ecg", "/locations")).toBe(false);
  });

  it("is false while the pathname is unknown", () => {
    expect(isActivePath(null, "/")).toBe(false);
  });
});

describe("ariaCurrent", () => {
  it("is 'page' on the page itself", () => {
    expect(ariaCurrent("/", "/")).toBe("page");
    expect(ariaCurrent("/locations", "/locations")).toBe("page");
    expect(ariaCurrent("/locations/", "/locations")).toBe("page");
  });

  it("is 'true' on a page inside the section", () => {
    expect(ariaCurrent("/locations/f8-islamabad", "/locations")).toBe("true");
    expect(ariaCurrent("/services/ecg", "/services")).toBe("true");
  });

  it("is absent elsewhere and while the pathname is unknown", () => {
    expect(ariaCurrent("/reports", "/locations")).toBeUndefined();
    expect(ariaCurrent("/about", "/")).toBeUndefined();
    expect(ariaCurrent(null, "/")).toBeUndefined();
  });
});

describe("navigation model", () => {
  const { navItems } = navigation;

  it("is in the fixed order, with tests before reports once they are live", () => {
    expect(navItems.map((item) => item.label)).toEqual([
      "Home",
      "About",
      "Services",
      ...(features.testDirectory ? ["Tests & prices"] : []),
      "Reports",
      "Locations",
      "Contact",
    ]);
  });

  it("links only to known routes", () => {
    const known: string[] = ["/", ...Object.values(routes)];
    for (const { href } of navItems) expect(known).toContain(href);
  });

  it("gives the mega menu to Services only", () => {
    expect(
      navItems.filter((item) => item.hasMegaMenu).map((item) => item.href),
    ).toEqual(["/services"]);
  });

  it("lists every service in the services menu exactly once", () => {
    const hrefs = serviceMenu.flatMap((group) =>
      group.items.map((item) => item.href),
    );
    expect(hrefs).toHaveLength(services.length);
    expect(new Set(hrefs).size).toBe(services.length);
  });

  it("has an icon for every service", () => {
    const missing = services.filter((s) => serviceIcon(s.icon) === null);
    expect(missing.map((s) => `${s.slug}: ${s.icon}`)).toEqual([]);
  });
});
