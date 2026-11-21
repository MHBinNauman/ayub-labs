import { describe, expect, it } from "vitest";
import {
  contentSecurityPolicy,
  MAP_FRAME_ORIGINS,
  securityHeaders,
} from "./security-headers";

const directive = (csp: string, name: string) =>
  csp.split("; ").find((part) => part === name || part.startsWith(`${name} `));

describe("contentSecurityPolicy", () => {
  const prod = contentSecurityPolicy({ dev: false });
  const dev = contentSecurityPolicy({ dev: true });

  it("locks everything to our own origin by default", () => {
    expect(directive(prod, "default-src")).toBe("default-src 'self'");
    expect(directive(prod, "object-src")).toBe("object-src 'none'");
    expect(directive(prod, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(prod, "form-action")).toBe("form-action 'self'");
  });

  it("allows only the Google Maps embed to be framed", () => {
    expect(directive(prod, "frame-src")).toBe(
      `frame-src ${MAP_FRAME_ORIGINS.join(" ")}`,
    );
  });

  it("never allows eval in production, only in development", () => {
    expect(prod).not.toContain("unsafe-eval");
    expect(dev).toContain("'unsafe-eval'");
  });

  it("upgrades insecure requests in production only", () => {
    expect(directive(prod, "upgrade-insecure-requests")).toBeDefined();
    expect(directive(dev, "upgrade-insecure-requests")).toBeUndefined();
  });
});

describe("securityHeaders", () => {
  it("sends the four headers", () => {
    const headers = Object.fromEntries(
      securityHeaders({ dev: false }).map((h) => [h.key, h.value]),
    );
    expect(Object.keys(headers)).toEqual([
      "Content-Security-Policy",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ]);
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
  });
});
