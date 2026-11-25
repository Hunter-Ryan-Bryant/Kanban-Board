// Human-readable text for the activity log. Activity rows store this text,
// so it's written once, when the change happens.
import { COLUMNS, PRIORITIES } from "./constants";
import { formatDueDate } from "./utils";

const MAX_QUOTED = 60;

const columnName = (id) => COLUMNS.find((c) => c.id === id)?.label ?? id;
const priorityName = (id) => PRIORITIES.find((p) => p.id === id)?.label ?? id;

function quote(text) {
  const clean = text.trim();
  return `"${clean.length > MAX_QUOTED ? `${clean.slice(0, MAX_QUOTED - 1)}…` : clean}"`;
}

// `value` is the new, saved value (null when cleared). `memberMap` maps
// team member ids to members, for naming assignees.
export function describeFieldChange(field, value, { memberMap = {}, locale } = {}) {
  switch (field) {
    case "title":
      return `Renamed to ${quote(value)}`;
    case "description":
      return value ? "Updated the description" : "Cleared the description";
    case "status":
      return `Status set to ${columnName(value)}`;
    case "priority":
      return `Priority set to ${priorityName(value)}`;
    case "assignee_id":
      return value
        ? `Assigned to ${memberMap[value]?.name ?? "a team member"}`
        : "Unassigned";
    case "due_date":
      return value
        ? `Due date set to ${formatDueDate(value, { locale })}`
        : "Removed the due date";
    default:
      return `Changed ${field.replace(/_/g, " ")}`;
  }
}

export function describeMove(fromStatus, toStatus) {
  return `Moved from ${columnName(fromStatus)} to ${columnName(toStatus)}`;
}

// `label` may be missing if it was deleted in the meantime.
export function describeLabelChange(added, label) {
  if (!label?.name) return added ? "Added a label" : "Removed a label";
  return `${added ? "Added" : "Removed"} label ${quote(label.name)}`;
}
