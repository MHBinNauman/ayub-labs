import { describe, expect, it } from "vitest";
import { fillTemplate, QUERY_TOKEN } from "./message-template";

describe("fillTemplate", () => {
  it("replaces the token with trimmed text", () => {
    expect(fillTemplate(`Do you offer "${QUERY_TOKEN}"?`, "  CBC ")).toBe(
      'Do you offer "CBC"?',
    );
  });
});
