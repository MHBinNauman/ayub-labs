/**
 * Opening-hours logic. Pure: nothing here reads the clock unless the caller
 * omits `now`, and every calculation happens in the site timezone
 * (Asia/Karachi), never the visitor's.
 */
import { timezone, type Branch, type DayKey } from "@/data/site-data";

export const DAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const satisfies readonly DayKey[];

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const WEEKDAY_TO_KEY: Record<string, DayKey> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

type HasHours = Pick<Branch, "hours">;

export type BranchStatus = {
  isOpen: boolean;
  /** Today's closing time, 24h "HH:mm". Present only while open. */
  closesAt?: string;
  /** Next opening. Present while closed, unless the branch never opens. */
  opensAt?: { day: DayKey; time: string };
  label: string;
};

export type WeekHoursRow = {
  /** "Mon – Sat" or "Sun" */
  days: string;
  /** "10:00 AM – 9:00 PM" or "Closed" */
  hours: string;
  /** "Mon – Sat: 10:00 AM – 9:00 PM" */
  label: string;
};

const zonedFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: timezone,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Weekday and 24h "HH:mm" wall-clock time of `now` in the site timezone. */
function zonedDayAndTime(now: Date): { day: DayKey; time: string } {
  const parts = zonedFormatter.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const day = WEEKDAY_TO_KEY[part("weekday")];
  if (!day) {
    throw new Error(`Unexpected weekday "${part("weekday")}" from Intl`);
  }
  return { day, time: `${part("hour")}:${part("minute")}` };
}

/**
 * "21:00" → "9:00 PM". Formatted by hand so the output always uses a plain
 * space; Intl puts a narrow no-break space before AM/PM.
 */
export function formatTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

/**
 * Whether a branch is open at `now`. A branch is open from its opening time
 * up to, but not including, its closing time.
 */
export function getBranchStatus(
  branch: HasHours,
  now: Date = new Date(),
): BranchStatus {
  const { day, time } = zonedDayAndTime(now);
  const today = branch.hours[day];

  if (today && time >= today.open && time < today.close) {
    return {
      isOpen: true,
      closesAt: today.close,
      label: `Open now · closes ${formatTime(today.close)}`,
    };
  }

  if (today && time < today.open) {
    return {
      isOpen: false,
      opensAt: { day, time: today.open },
      label: `Closed · opens ${formatTime(today.open)}`,
    };
  }

  // Offset 7 is the same weekday next week, for a branch open one day a week.
  const todayIndex = DAY_KEYS.indexOf(day);
  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = DAY_KEYS[(todayIndex + offset) % 7];
    const hours = branch.hours[nextDay];
    if (hours) {
      return {
        isOpen: false,
        opensAt: { day: nextDay, time: hours.open },
        label: `Closed · opens ${DAY_LABELS[nextDay]} ${formatTime(hours.open)}`,
      };
    }
  }

  return { isOpen: false, label: "Closed" };
}

/** The week as display rows, with consecutive identical days grouped. */
export function formatWeekHours(branch: HasHours): WeekHoursRow[] {
  const groups: { first: DayKey; last: DayKey; hours: string }[] = [];

  for (const day of DAY_KEYS) {
    const dayHours = branch.hours[day];
    const hours = dayHours
      ? `${formatTime(dayHours.open)} – ${formatTime(dayHours.close)}`
      : "Closed";

    const previous = groups.at(-1);
    if (previous && previous.hours === hours) {
      previous.last = day;
    } else {
      groups.push({ first: day, last: day, hours });
    }
  }

  return groups.map(({ first, last, hours }) => {
    const days =
      first === last
        ? DAY_LABELS[first]
        : `${DAY_LABELS[first]} – ${DAY_LABELS[last]}`;
    return { days, hours, label: `${days}: ${hours}` };
  });
}
