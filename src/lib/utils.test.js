import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cx,
  errorMessage,
  formatDueDate,
  formatTimestamp,
  getDueDateStatus,
  getInitials,
  indexById,
  removeById,
  upsertById,
} from "./utils";

const en = { locale: "en-US" };

describe("getDueDateStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Local time, mid-afternoon, so "today" doesn't depend on the time zone.
    vi.setSystemTime(new Date(2026, 10, 25, 15, 30));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null without a due date", () => {
    expect(getDueDateStatus(null, "todo")).toBeNull();
    expect(getDueDateStatus("", "todo")).toBeNull();
  });

  it("marks done tasks as completed even when the date has passed", () => {
    expect(getDueDateStatus("2026-01-01", "done", en)).toEqual({
      type: "completed",
      label: "Jan 1",
    });
  });

  it("marks past dates as overdue", () => {
    expect(getDueDateStatus("2026-11-24", "todo", en)).toEqual({
      type: "overdue",
      label: "Overdue · Nov 24",
    });
  });

  it("marks today and the next two days as due soon", () => {
    expect(getDueDateStatus("2026-11-25", "in_progress", en)).toEqual({
      type: "due_soon",
      label: "Due today",
    });
    expect(getDueDateStatus("2026-11-26", "todo", en)?.label).toBe(
      "Due tomorrow",
    );
    expect(getDueDateStatus("2026-11-27", "todo", en)?.label).toBe(
      "Due in 2 days",
    );
  });

  it("marks later dates as upcoming", () => {
    expect(getDueDateStatus("2026-11-28", "todo", en)).toEqual({
      type: "upcoming",
      label: "Nov 28",
    });
  });

  it("handles month and year boundaries", () => {
    vi.setSystemTime(new Date(2026, 11, 31, 9, 0));
    expect(getDueDateStatus("2027-01-01", "todo", en)?.label).toBe(
      "Due tomorrow",
    );
    expect(getDueDateStatus("2027-01-05", "todo", en)?.label).toBe(
      "Jan 5, 2027",
    );
    expect(getDueDateStatus("2026-12-30", "todo", en)?.type).toBe("overdue");
  });
});

describe("formatDueDate", () => {
  const now = new Date(2026, 10, 25, 12, 0);

  it("omits the year for dates in the current year", () => {
    expect(formatDueDate("2026-11-28", { ...en, now })).toBe("Nov 28");
  });

  it("includes the year for other years", () => {
    expect(formatDueDate("2027-01-04", { ...en, now })).toBe("Jan 4, 2027");
    expect(formatDueDate("2025-12-31", { ...en, now })).toBe("Dec 31, 2025");
  });

  it("reads the date as local, not UTC", () => {
    // new Date("2026-03-01") is UTC midnight, which is Feb 28 in the Americas.
    expect(formatDueDate("2026-03-01", { ...en, now })).toBe("Mar 1");
  });
});

describe("formatTimestamp", () => {
  const now = new Date(2026, 10, 25, 18, 0); // Wed, Nov 25, 2026
  const at = (...args) => new Date(...args).toISOString();
  // Some ICU versions put a narrow no-break space before "AM"/"PM".
  const fmt = (ts) => formatTimestamp(ts, { ...en, now }).replace(/\s/g, " ");

  it("shows only the time for today", () => {
    expect(fmt(at(2026, 10, 25, 15, 40))).toBe("3:40 PM");
  });

  it("says Yesterday for the previous day", () => {
    expect(fmt(at(2026, 10, 24, 9, 5))).toBe("Yesterday, 9:05 AM");
  });

  it("uses the weekday within the past week", () => {
    expect(fmt(at(2026, 10, 20, 14, 0))).toBe("Fri, 2:00 PM");
  });

  it("uses the month and day earlier this year", () => {
    expect(fmt(at(2026, 10, 3, 15, 40))).toBe("Nov 3, 3:40 PM");
  });

  it("uses the full date for other years", () => {
    expect(fmt(at(2025, 10, 3, 15, 40))).toBe("Nov 3, 2025");
  });
});

describe("upsertById", () => {
  const list = [
    { id: 1, name: "a" },
    { id: 2, name: "b" },
  ];

  it("appends a new row by default", () => {
    expect(upsertById(list, { id: 3, name: "c" }).map((r) => r.id)).toEqual([
      1, 2, 3,
    ]);
  });

  it("prepends a new row when asked", () => {
    expect(
      upsertById(list, { id: 3 }, { prepend: true }).map((r) => r.id),
    ).toEqual([3, 1, 2]);
  });

  it("merges into an existing row in place instead of duplicating it", () => {
    const next = upsertById(list, { id: 2, name: "B", extra: true });
    expect(next).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "B", extra: true },
    ]);
  });

  it("does not mutate the input", () => {
    upsertById(list, { id: 2, name: "changed" });
    upsertById(list, { id: 9 });
    expect(list).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ]);
  });
});

describe("removeById", () => {
  const list = [{ id: 1 }, { id: 2 }];

  it("removes the matching row", () => {
    expect(removeById(list, 1)).toEqual([{ id: 2 }]);
  });

  it("returns the same array when nothing matches, so React can skip a render", () => {
    expect(removeById(list, 99)).toBe(list);
  });
});

describe("indexById", () => {
  it("maps ids to rows", () => {
    const a = { id: "a" };
    const b = { id: "b" };
    expect(indexById([a, b])).toEqual({ a, b });
  });
});

describe("getInitials", () => {
  it("uses up to two initials, uppercased", () => {
    expect(getInitials("alex rivera")).toBe("AR");
    expect(getInitials("Mary Jane Watson")).toBe("MJ");
    expect(getInitials("Prince")).toBe("P");
  });

  it("ignores extra whitespace", () => {
    expect(getInitials("  alex   rivera ")).toBe("AR");
  });

  it("falls back to ? for an empty name", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials(null)).toBe("?");
  });
});

describe("cx", () => {
  it("joins class names and skips falsy values", () => {
    const isActive = false;
    expect(cx("a", isActive && "b", null, undefined, "", "c")).toBe("a c");
    expect(cx()).toBe("");
  });
});

describe("errorMessage", () => {
  it("uses the error's message, or a fallback", () => {
    expect(errorMessage({ message: "boom" })).toBe("boom");
    expect(errorMessage(null)).toBe("no data returned");
  });
});
