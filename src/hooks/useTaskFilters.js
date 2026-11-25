import { useMemo, useState } from "react";
import { DEFAULT_FILTERS, filterTasks, hasActiveFilters } from "../lib/filters";

export function useTaskFilters(tasks, taskLabelsMap) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  function setFilter(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const filteredTasks = useMemo(
    () => filterTasks(tasks, filters, taskLabelsMap),
    [tasks, filters, taskLabelsMap],
  );

  return {
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(filters),
    filteredTasks,
  };
}
