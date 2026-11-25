import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FILTERS, filterTasks, hasActiveFilters } from "./filters";

const tasks = [
  {
    id: "t1",
    title: "Fix login bug",
    description: "Users can't sign in on Safari",
    priority: "high",
    status: "todo",
    due_date: "2026-11-20", // overdue
    assignee_id: "alex",
  },
  {
    id: "t2",
    title: "Write docs",
    description: null,
    priority: "low",
    status: "in_progress",
    due_date: "2026-11-26", // due soon
    assignee_id: null,
  },
  {
    id: "t3",
    title: "Ship release",
    description: "",
    priority: "normal",
    status: "done",
    due_date: "2026-11-01", // past, but done
    assignee_id: "sam",
  },
];
const taskLabelsMap = { t1: ["bug"], t3: ["bug", "release"] };

const ids = (filters) =>
  filterTasks(tasks, { ...DEFAULT_FILTERS, ...filters }, taskLabelsMap).map(
    (t) => t.id,
  );

describe("filterTasks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 25, 12, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns every task with the default filters", () => {
    expect(ids({})).toEqual(["t1", "t2", "t3"]);
  });

  it("searches titles and descriptions, case-insensitively", () => {
    expect(ids({ search: "SAFARI" })).toEqual(["t1"]);
    expect(ids({ search: "  docs " })).toEqual(["t2"]);
    expect(ids({ search: "nothing matches" })).toEqual([]);
  });

  it("filters by priority", () => {
    expect(ids({ priority: "low" })).toEqual(["t2"]);
  });

  it("filters by urgency, ignoring finished tasks", () => {
    expect(ids({ urgency: "overdue" })).toEqual(["t1"]);
    expect(ids({ urgency: "due_soon" })).toEqual(["t2"]);
  });

  it("filters by assignee, including unassigned", () => {
    expect(ids({ assignee: "sam" })).toEqual(["t3"]);
    expect(ids({ assignee: "unassigned" })).toEqual(["t2"]);
  });

  it("filters by label", () => {
    expect(ids({ label: "bug" })).toEqual(["t1", "t3"]);
    expect(ids({ label: "release" })).toEqual(["t3"]);
  });

  it("combines filters", () => {
    expect(ids({ label: "bug", priority: "high" })).toEqual(["t1"]);
    expect(ids({ label: "bug", assignee: "alex", search: "release" })).toEqual(
      [],
    );
  });
});

describe("hasActiveFilters", () => {
  it("is false for the defaults and true once anything changes", () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: "x" })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, label: "bug" })).toBe(true);
  });
});
