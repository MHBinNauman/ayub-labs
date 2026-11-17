import { describe, expect, it } from "vitest";
import { services } from "@/data/site-data";
import { isActivePath, mainNav, serviceMenu } from "./nav";
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
  });

  it("does not match a different path that shares a prefix", () => {
    expect(isActivePath("/servicesx", "/services")).toBe(false);
    expect(isActivePath("/reports", "/services")).toBe(false);
  });

  it("is false while the pathname is unknown", () => {
    expect(isActivePath(null, "/")).toBe(false);
  });
});

describe("navigation model", () => {
  it("has exactly one mega menu entry", () => {
    expect(mainNav.filter((item) => item.megaMenu)).toHaveLength(1);
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
