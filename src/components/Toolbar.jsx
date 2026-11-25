import css from "./Toolbar.module.css";

export default function Toolbar({
  filters,
  setFilter,
  clearFilters,
  hasActiveFilters,
  labels,
  teamMembers,
}) {
  return (
    <div className={css.toolbar}>
      <div className={css.search}>
        <span aria-hidden="true" className={css.searchIcon}>
          🔍
        </span>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          placeholder="Search tasks..."
          aria-label="Search tasks"
          className={css.searchInput}
        />
      </div>
      <div className={css.filters}>
        <select
          value={filters.label}
          onChange={(e) => setFilter("label", e.target.value)}
          aria-label="Filter by label"
          className={css.filter}
        >
          <option value="all">All Labels</option>
          {labels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <select
          value={filters.assignee}
          onChange={(e) => setFilter("assignee", e.target.value)}
          aria-label="Filter by assignee"
          className={css.filter}
        >
          <option value="all">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {teamMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilter("priority", e.target.value)}
          aria-label="Filter by priority"
          className={css.filter}
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="normal">Normal Priority</option>
          <option value="low">Low Priority</option>
        </select>
        <select
          value={filters.urgency}
          onChange={(e) => setFilter("urgency", e.target.value)}
          aria-label="Filter by due date"
          className={css.filter}
        >
          <option value="all">All Due Dates</option>
          <option value="overdue">Overdue Only</option>
          <option value="due_soon">Due Today / Soon</option>
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={css.clearButton}
            aria-label="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
