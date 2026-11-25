import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cx,
  errorMessage,
  getDueDateStatus,
  getInitials,
  indexById,
  removeById,
  upsertById,
} from "./utils";

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
    expect(getDueDateStatus("2026-01-01", "done")).toMatchObject({
      type: "completed",
      label: "2026-01-01",
    });
  });

  it("marks past dates as overdue", () => {
    expect(getDueDateStatus("2026-11-24", "todo")).toMatchObject({
      type: "overdue",
      label: "Overdue (2026-11-24)",
    });
  });

  it("marks today as due today", () => {
    expect(getDueDateStatus("2026-11-25", "in_progress")).toMatchObject({
      type: "due_soon",
      label: "Due Today",
    });
  });

  it("marks the next two days as due soon", () => {
    expect(getDueDateStatus("2026-11-26", "todo")).toMatchObject({
      type: "due_soon",
      label: "Due in 1d",
    });
    expect(getDueDateStatus("2026-11-27", "todo")).toMatchObject({
      type: "due_soon",
      label: "Due in 2d",
    });
  });

  it("marks later dates as upcoming", () => {
    expect(getDueDateStatus("2026-11-28", "todo")).toMatchObject({
      type: "upcoming",
      label: "2026-11-28",
    });
  });

  it("handles month and year boundaries", () => {
    vi.setSystemTime(new Date(2026, 11, 31, 9, 0));
    expect(getDueDateStatus("2027-01-01", "todo")?.label).toBe("Due in 1d");
    expect(getDueDateStatus("2026-12-30", "todo")?.type).toBe("overdue");
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
