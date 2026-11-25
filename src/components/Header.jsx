import { useMemo } from "react";
import { cx, getDueDateStatus } from "../lib/utils";
import css from "./Header.module.css";
import ui from "./ui.module.css";

// The dot's color comes from data-status in Header.module.css.
const REALTIME_STATES = {
  live: {
    label: "Live",
    title: "Changes from other tabs and devices appear instantly",
  },
  offline: {
    label: "Reconnecting…",
    title: "Live updates paused, reconnecting…",
  },
  connecting: {
    label: "Connecting…",
    title: "Connecting to live updates…",
  },
};

// `tone`: "success" | "danger" | "muted" | undefined
function StatBadge({ label, value, tone, alert = false }) {
  return (
    <div className={cx(css.stat, alert && css.statAlert)}>
      <span className={css.statLabel}>{label}</span>
      <span className={css.statValue} data-tone={tone}>
        {value}
      </span>
    </div>
  );
}

export default function Header({
  tasks,
  realtimeStatus,
  labelCount,
  memberCount,
  onOpenLabels,
  onOpenTeam,
  onNewTask,
}) {
  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "done").length,
      overdue: tasks.filter(
        (t) => getDueDateStatus(t.due_date, t.status)?.type === "overdue",
      ).length,
    }),
    [tasks],
  );
  const status = REALTIME_STATES[realtimeStatus] ? realtimeStatus : "connecting";
  const realtime = REALTIME_STATES[status];
  const hasOverdue = stats.overdue > 0;

  return (
    <header className={css.header}>
      <div>
        <h1 className={css.logo}>Kanban Workspace</h1>
        <p className={css.subtitle}>
          Guest workspace · saved automatically to this browser
        </p>
        <p role="status" className={css.realtimeStatus} title={realtime.title}>
          <span
            aria-hidden="true"
            className={css.realtimeDot}
            data-status={status}
          />
          {realtime.label}
        </p>
      </div>

      <div className={css.actions}>
        <div className={css.stats}>
          <StatBadge label="Total" value={stats.total} />
          <StatBadge label="Done" value={stats.completed} tone="success" />
          <StatBadge
            label="Overdue"
            value={stats.overdue}
            tone={hasOverdue ? "danger" : "muted"}
            alert={hasOverdue}
          />
        </div>

        <button type="button" className={ui.headerButton} onClick={onOpenLabels}>
          <span aria-hidden="true">🏷️ </span>Labels ({labelCount})
        </button>
        <button type="button" className={ui.headerButton} onClick={onOpenTeam}>
          <span aria-hidden="true">👥 </span>Team ({memberCount})
        </button>
        <button type="button" className={ui.primaryButton} onClick={onNewTask}>
          + New Task
        </button>
      </div>
    </header>
  );
}
