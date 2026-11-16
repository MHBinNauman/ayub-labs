import { describe, expect, it } from "vitest";
import type { Branch } from "@/data/site-data";
import { formatTime, formatWeekHours, getBranchStatus } from "./hours";

// A fixture, not a real branch, so the tests survive the client changing hours.
const tenToNine = { open: "10:00", close: "21:00" };
const branch: Pick<Branch, "hours"> = {
  hours: {
    mon: tenToNine,
    tue: tenToNine,
    wed: tenToNine,
    thu: tenToNine,
    fri: tenToNine,
    sat: tenToNine,
    sun: null,
  },
};

/** An instant given as Karachi wall-clock time (UTC+5, no DST). */
const karachi = (date: string, time: string) =>
  new Date(`${date}T${time}:00+05:00`);

// Week used below: Mon 16 Nov 2026 … Sun 22 Nov 2026.
const TUE = "2026-11-17";
const SAT = "2026-11-21";
const SUN = "2026-11-22";

describe("getBranchStatus", () => {
  it("is open mid-day on a Tuesday", () => {
    expect(getBranchStatus(branch, karachi(TUE, "13:00"))).toEqual({
      isOpen: true,
      closesAt: "21:00",
      label: "Open now · closes 9:00 PM",
    });
  });

  it("is still open at 20:59", () => {
    const status = getBranchStatus(branch, karachi(TUE, "20:59"));
    expect(status.isOpen).toBe(true);
    expect(status.closesAt).toBe("21:00");
  });

  it("is closed from 21:00 exactly, and points at the next morning", () => {
    expect(getBranchStatus(branch, karachi(TUE, "21:00"))).toEqual({
      isOpen: false,
      opensAt: { day: "wed", time: "10:00" },
      label: "Closed · opens Wed 10:00 AM",
    });
  });

  it("is closed at 09:59 and opens at 10:00 exactly", () => {
    expect(getBranchStatus(branch, karachi(TUE, "09:59"))).toEqual({
      isOpen: false,
      opensAt: { day: "tue", time: "10:00" },
      label: "Closed · opens 10:00 AM",
    });
    expect(getBranchStatus(branch, karachi(TUE, "10:00")).isOpen).toBe(true);
  });

  it("on Saturday night, skips Sunday and opens Monday", () => {
    expect(getBranchStatus(branch, karachi(SAT, "22:30"))).toEqual({
      isOpen: false,
      opensAt: { day: "mon", time: "10:00" },
      label: "Closed · opens Mon 10:00 AM",
    });
  });

  it.each(["00:30", "12:00", "23:30"])(
    "is closed all day Sunday (%s) and opens Monday",
    (time) => {
      expect(getBranchStatus(branch, karachi(SUN, time))).toEqual({
        isOpen: false,
        opensAt: { day: "mon", time: "10:00" },
        label: "Closed · opens Mon 10:00 AM",
      });
    },
  );

  it("uses the Karachi weekday, not the UTC one", () => {
    // Sunday 21:00 UTC is already Monday 02:00 in Karachi.
    const status = getBranchStatus(branch, new Date("2026-11-22T21:00:00Z"));
    expect(status).toEqual({
      isOpen: false,
      opensAt: { day: "mon", time: "10:00" },
      label: "Closed · opens 10:00 AM",
    });

    // Monday 04:30 UTC is 09:30 in Karachi (closed); 05:00 UTC is 10:00 (open).
    expect(
      getBranchStatus(branch, new Date("2026-11-23T04:30:00Z")).isOpen,
    ).toBe(false);
    expect(
      getBranchStatus(branch, new Date("2026-11-23T05:00:00Z")).isOpen,
    ).toBe(true);
  });

  it("wraps a full week for a branch open one day a week", () => {
    const tuesdaysOnly: Pick<Branch, "hours"> = {
      hours: {
        ...branch.hours,
        mon: null,
        wed: null,
        thu: null,
        fri: null,
        sat: null,
      },
    };
    expect(getBranchStatus(tuesdaysOnly, karachi(TUE, "22:00")).label).toBe(
      "Closed · opens Tue 10:00 AM",
    );
  });

  it("reports plain Closed for a branch with no open days", () => {
    const never: Pick<Branch, "hours"> = {
      hours: {
        mon: null,
        tue: null,
        wed: null,
        thu: null,
        fri: null,
        sat: null,
        sun: null,
      },
    };
    expect(getBranchStatus(never, karachi(TUE, "13:00"))).toEqual({
      isOpen: false,
      label: "Closed",
    });
  });
});

describe("formatWeekHours", () => {
  it("groups consecutive days with the same hours", () => {
    expect(formatWeekHours(branch)).toEqual([
      {
        days: "Mon – Sat",
        hours: "10:00 AM – 9:00 PM",
        label: "Mon – Sat: 10:00 AM – 9:00 PM",
      },
      { days: "Sun", hours: "Closed", label: "Sun: Closed" },
    ]);
  });

  it("starts a new row when hours change mid-week", () => {
    const shortFriday: Pick<Branch, "hours"> = {
      hours: { ...branch.hours, fri: { open: "14:30", close: "21:00" } },
    };
    expect(formatWeekHours(shortFriday).map((row) => row.label)).toEqual([
      "Mon – Thu: 10:00 AM – 9:00 PM",
      "Fri: 2:30 PM – 9:00 PM",
      "Sat: 10:00 AM – 9:00 PM",
      "Sun: Closed",
    ]);
  });
});

describe("formatTime", () => {
  it.each([
    ["00:00", "12:00 AM"],
    ["09:05", "9:05 AM"],
    ["12:00", "12:00 PM"],
    ["21:00", "9:00 PM"],
    ["23:59", "11:59 PM"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });
});
