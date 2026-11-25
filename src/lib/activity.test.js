import { describe, expect, it } from "vitest";
import {
  describeFieldChange,
  describeLabelChange,
  describeMove,
} from "./activity";

describe("describeFieldChange", () => {
  const memberMap = { m1: { id: "m1", name: "Alex Rivera" } };

  it("names columns and priorities instead of ids", () => {
    expect(describeFieldChange("status", "in_progress")).toBe(
      "Status set to In Progress",
    );
    expect(describeFieldChange("priority", "high")).toBe("Priority set to High");
  });

  it("names the assignee, or says Unassigned", () => {
    expect(describeFieldChange("assignee_id", "m1", { memberMap })).toBe(
      "Assigned to Alex Rivera",
    );
    expect(describeFieldChange("assignee_id", "gone", { memberMap })).toBe(
      "Assigned to a team member",
    );
    expect(describeFieldChange("assignee_id", null)).toBe("Unassigned");
  });

  it("formats due dates and their removal", () => {
    expect(
      describeFieldChange("due_date", "2026-11-28", { locale: "en-US" }),
    ).toMatch(/^Due date set to Nov 28/);
    expect(describeFieldChange("due_date", null)).toBe("Removed the due date");
  });

  it("quotes new titles and shortens long ones", () => {
    expect(describeFieldChange("title", "Fix login")).toBe(
      'Renamed to "Fix login"',
    );
    const long = describeFieldChange("title", "x".repeat(100));
    expect(long.length).toBeLessThan(80);
    expect(long).toMatch(/…"$/);
  });

  it("doesn't repeat description text", () => {
    expect(describeFieldChange("description", "a long body")).toBe(
      "Updated the description",
    );
    expect(describeFieldChange("description", null)).toBe(
      "Cleared the description",
    );
  });
});

describe("describeMove", () => {
  it("uses column names", () => {
    expect(describeMove("todo", "in_review")).toBe(
      "Moved from To Do to In Review",
    );
  });
});

describe("describeLabelChange", () => {
  it("names the label", () => {
    expect(describeLabelChange(true, { name: "Bug" })).toBe('Added label "Bug"');
    expect(describeLabelChange(false, { name: "Bug" })).toBe(
      'Removed label "Bug"',
    );
  });

  it("falls back when the label no longer exists", () => {
    expect(describeLabelChange(true, undefined)).toBe("Added a label");
  });
});
