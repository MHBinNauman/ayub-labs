import { describe, expect, it } from "vitest";
import {
  isPhoto,
  maxWidth,
  nameClashes,
  outputName,
  outputSrc,
  renderGeneratedMedia,
} from "./image-pipeline";

const jpg = { transparent: false };

describe("isPhoto", () => {
  it("accepts jpg, jpeg and png in any case", () => {
    expect(["a.jpg", "a.JPEG", "a.png"].every(isPhoto)).toBe(true);
  });

  it("ignores everything else", () => {
    expect(["a.webp", "a.csv", "a.jpg.bak", "jpg"].some(isPhoto)).toBe(false);
  });
});

describe("maxWidth", () => {
  it("gives heroes 2400px and everything else 1600px", () => {
    expect(maxWidth("hero-1-lab.jpg")).toBe(2400);
    expect(maxWidth("banner-about.jpg")).toBe(1600);
    expect(maxWidth("svc-hero-shot.jpg")).toBe(1600);
  });
});

describe("outputName", () => {
  it("keeps an already safe name", () => {
    expect(outputName("svc-ecg.jpg", jpg)).toBe("svc-ecg.jpg");
  });

  it("makes camera and phone names URL-safe", () => {
    expect(outputName("Reception (Saddar) 1.JPEG", jpg)).toBe(
      "reception-saddar-1.jpg",
    );
  });

  it("keeps png only for transparency", () => {
    expect(outputName("logo.png", { transparent: true })).toBe("logo.png");
    expect(outputName("logo.png", jpg)).toBe("logo.jpg");
  });

  it("rejects a name with nothing usable in it", () => {
    expect(() => outputName("(؟).jpg", jpg)).toThrowError(/rename it/);
  });
});

describe("nameClashes", () => {
  it("is empty when every copy has its own name", () => {
    expect(nameClashes(["a.jpg", "b.jpg"])).toEqual([]);
  });

  it("reports originals that would overwrite each other", () => {
    expect(nameClashes(["Lab 1.jpg", "other.jpg", "lab-1.png"])).toEqual([
      '"Lab 1.jpg" and "lab-1.png"',
    ]);
  });
});

describe("renderGeneratedMedia", () => {
  const file = (name: string) => ({
    src: outputSrc("stock", name),
    width: 16,
    height: 9,
    blurDataURL: "data:image/webp;base64,AAAA",
  });

  it("does not depend on the order files were read in", () => {
    const files = [file("b.jpg"), file("a.jpg")];
    const text = renderGeneratedMedia(files);
    expect(text).toBe(renderGeneratedMedia(files.toReversed()));
    expect(text.indexOf("/a.jpg")).toBeLessThan(text.indexOf("/b.jpg"));
  });
});
