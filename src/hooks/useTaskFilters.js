import { useMemo, useState } from "react";
import { getDueDateStatus } from "../lib/utils";

const DEFAULT_FILTERS = {
  search: "",
  label: "all",
  assignee: "all",
  priority: "all",
  urgency: "all",
};

export function useTaskFilters(tasks, taskLabelsMap) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  function setFilter(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const hasActiveFilters = Object.keys(DEFAULT_FILTERS).some(
    (key) => filters[key] !== DEFAULT_FILTERS[key],
  );

  const filteredTasks = useMemo(() => {
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
  }, [tasks, taskLabelsMap, filters]);

  return { filters, setFilter, clearFilters, hasActiveFilters, filteredTasks };
}
