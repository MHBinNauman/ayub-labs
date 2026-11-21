import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site-url";

const DOMAIN = "example.com";

describe("resolveSiteUrl", () => {
  it.each([undefined, "", "   "])(
    "falls back to the brand domain (%j)",
    (raw) => {
      expect(resolveSiteUrl(raw, DOMAIN)).toBe("https://example.com");
    },
  );

  it.each([
    ["https://preview.example.org", "https://preview.example.org"],
    ["https://preview.example.org/", "https://preview.example.org"],
    [
      "https://preview.example.org/some/path?x=1#y",
      "https://preview.example.org",
    ],
    ["https://preview.example.org:8443", "https://preview.example.org:8443"],
    ["http://localhost:3000", "http://localhost:3000"],
  ])("normalises %j to an origin", (raw, expected) => {
    expect(resolveSiteUrl(raw, DOMAIN)).toBe(expected);
  });

  it("rejects http outside localhost", () => {
    expect(() => resolveSiteUrl("http://example.org", DOMAIN)).toThrow(
      /must use https/,
    );
  });

  it.each(["example.org", "ftp://example.org", "not a url"])(
    "rejects %j",
    (raw) => {
      expect(() => resolveSiteUrl(raw, DOMAIN)).toThrow(/NEXT_PUBLIC_SITE_URL/);
    },
  );
});
