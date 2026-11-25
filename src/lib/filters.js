import { getDueDateStatus } from "./utils";

export const DEFAULT_FILTERS = {
  search: "",
  label: "all",
  assignee: "all",
  priority: "all",
  urgency: "all",
};

export function hasActiveFilters(filters) {
  return Object.keys(DEFAULT_FILTERS).some(
    (key) => filters[key] !== DEFAULT_FILTERS[key],
  );
}

// `taskLabelsMap` maps a task id to the ids of its labels.
export function filterTasks(tasks, filters, taskLabelsMap) {
  const q = filters.search.toLowerCase().trim();
  return tasks.filter((task) => {
    const matchesSearch =
      !q ||
      task.title.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q));
    const matchesPriority =
      filters.priority === "all" || task.priority === filters.priority;
    const dateType = getDueDateStatus(task.due_date, task.status)?.type;
    const matchesUrgency =
      filters.urgency === "all" || dateType === filters.urgency;
    const matchesAssignee =
      filters.assignee === "all" ||
      (filters.assignee === "unassigned" && !task.assignee_id) ||
      task.assignee_id === filters.assignee;
    const matchesLabel =
      filters.label === "all" ||
      (taskLabelsMap[task.id] || []).includes(filters.label);

    return (
      matchesSearch &&
      matchesPriority &&
      matchesUrgency &&
      matchesAssignee &&
      matchesLabel
    );
  });
}
