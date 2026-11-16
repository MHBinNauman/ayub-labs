import { describe, expect, it } from "vitest";
import * as siteData from "@/data/site-data";
import { findSiteDataIssues, validateSiteData } from "./validate";

type Data = typeof siteData;
type Mutable<T> = { -readonly [K in keyof T]: Mutable<T[K]> };

/** Issues for a deep copy of the real data after `mutate` has broken it. */
function issuesAfter(mutate: (data: Mutable<Data>) => void): string[] {
  const copy = structuredClone({ ...siteData }) as Mutable<Data>;
  mutate(copy);
  return findSiteDataIssues(copy);
}

describe("validateSiteData", () => {
  it("accepts the real site data", () => {
    expect(findSiteDataIssues()).toEqual([]);
    expect(() => validateSiteData()).not.toThrow();
  });

  it("throws one error that lists every issue", () => {
    const copy = structuredClone({ ...siteData }) as Mutable<Data>;
    copy.branches[0].phones[0] = "051-8448533";
    copy.services[1].slug = copy.services[0].slug;
    expect(() => validateSiteData(copy)).toThrowError(
      /failed validation \(2 issues\)/,
    );
  });

  it.each(["051-8448533", "03225135060", "+92 322 5135060", "923225135060"])(
    "rejects a branch phone that is not E.164 (%s)",
    (phone) => {
      const issues = issuesAfter((data) => {
        data.branches[0].phones[0] = phone;
      });
      expect(issues).toEqual([
        expect.stringMatching(
          /^branches\[0\]\.phones\[0\]: phone must be E\.164/,
        ),
      ]);
    },
  );

  it("rejects a contact phone that is not E.164", () => {
    const issues = issuesAfter((data) => {
      (data.contact.mobile.e164 as string) = "0322-5135060";
    });
    expect(issues).toEqual([
      expect.stringMatching(/^contact\.mobile\.e164: phone must be E\.164/),
    ]);
  });

  it("rejects a branch whose every day is closed", () => {
    const issues = issuesAfter((data) => {
      data.branches[1].hours = {
        mon: null,
        tue: null,
        wed: null,
        thu: null,
        fri: null,
        sat: null,
        sun: null,
      };
    });
    expect(issues).toEqual(["branches[1].hours: branch has no opening hours"]);
  });

  it("rejects a branch with the hours missing", () => {
    const issues = issuesAfter((data) => {
      delete (data.branches[1] as { hours?: unknown }).hours;
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(/^branches\[1\]\.hours: /);
  });

  it("rejects closing before opening", () => {
    const issues = issuesAfter((data) => {
      data.branches[0].hours = {
        ...data.branches[0].hours,
        mon: { open: "21:00", close: "10:00" },
      };
    });
    expect(issues).toEqual([
      "branches[0].hours.mon: open must be before close",
    ]);
  });

  it("rejects a duplicated service slug", () => {
    const issues = issuesAfter((data) => {
      data.services[5].slug = "haematology";
    });
    expect(issues).toEqual([
      'services[5]: duplicate service slug "haematology"',
    ]);
  });

  it.each([
    ["TODO", "TODO(client): write this"],
    ["lorem", "Lorem ipsum dolor sit amet"],
    ["0 K", "0 K tests performed"],
    ["0K", "Over 0K patients"],
  ])("rejects %s in a rendered string", (_name, text) => {
    const issues = issuesAfter((data) => {
      data.services[0].summary = text;
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(
      /^services\[0\]\.summary: rendered text contains/,
    );
  });

  it("does not mistake ordinary numbers for a broken counter", () => {
    const issues = issuesAfter((data) => {
      data.services[0].summary = "More than 10 K tests and 200 M results";
    });
    expect(issues).toEqual([]);
  });

  it("ignores forbidden words in fields that are never rendered", () => {
    const issues = issuesAfter((data) => {
      data.branches[0].regulator.note = "TODO: ask the client";
      data.services[0].legacyName = "Lorem";
    });
    expect(issues).toEqual([]);
  });

  it("tolerates the unverified TODO(...) marker but not a verified one", () => {
    // The real F-8 branch carries the marker, and the real data passes.
    expect(siteData.branches[1].regulator).toMatchObject({
      value: "TODO(client)",
      verified: false,
    });

    const issues = issuesAfter((data) => {
      data.branches[1].regulator.verified = true;
    });
    expect(issues).toEqual([
      expect.stringMatching(
        /^branches\[1\]\.regulator\.value: rendered text contains "TODO"/,
      ),
    ]);
  });

  it("rejects a feature flag that is on with no data behind it", () => {
    const issues = issuesAfter((data) => {
      (data.features.doctorsSection as boolean) = true;
    });
    expect(issues).toEqual([
      "features.doctorsSection: is on but doctors is empty",
    ]);
  });

  it('rejects any trust claim other than "Registered"', () => {
    const issues = issuesAfter((data) => {
      (data.registrations[0].claim as string) = "Accredited";
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(/^registrations\[0\]\.claim: /);
  });
});
