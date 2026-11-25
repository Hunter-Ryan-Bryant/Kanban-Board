import { useMemo } from "react";
import { getDueDateStatus } from "../lib/utils";
import { styles } from "../styles";

const REALTIME_STATES = {
  live: {
    label: "Live",
    color: "#10b981",
    title: "Changes from other tabs and devices appear instantly",
  },
  offline: {
    label: "Reconnecting…",
    color: "#ef4444",
    title: "Live updates paused, reconnecting…",
  },
  connecting: {
    label: "Connecting…",
    color: "#f59e0b",
    title: "Connecting to live updates…",
  },
};

function StatBadge({ label, value, valueColor, borderColor }) {
  return (
    <div style={{ ...styles.statBadge, ...(borderColor && { borderColor }) }}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{ ...styles.statValue, ...(valueColor && { color: valueColor }) }}>
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
  const realtime = REALTIME_STATES[realtimeStatus] ?? REALTIME_STATES.connecting;
  const hasOverdue = stats.overdue > 0;

  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.logo}>Kanban Workspace</h1>
        <p style={styles.subtitle}>
          Guest Session Active • Custom Tags, Assignments & Audit Logs
        </p>
        <p role="status" style={styles.realtimeStatus} title={realtime.title}>
          <span
            aria-hidden="true"
            style={{ ...styles.realtimeDot, backgroundColor: realtime.color }}
          />
          {realtime.label}
        </p>
      </div>

      <div style={styles.headerRight}>
        <div style={styles.statsGroup}>
          <StatBadge label="Total" value={stats.total} />
          <StatBadge label="Done" value={stats.completed} valueColor="#10b981" />
          <StatBadge
            label="Overdue"
            value={stats.overdue}
            valueColor={hasOverdue ? "#f87171" : "#94a3b8"}
            borderColor={hasOverdue ? "#7f1d1d" : "#1e293b"}
          />
        </div>

        <button style={styles.secondaryHeaderBtn} onClick={onOpenLabels}>
          <span aria-hidden="true">🏷️ </span>Labels ({labelCount})
        </button>
        <button style={styles.secondaryHeaderBtn} onClick={onOpenTeam}>
          <span aria-hidden="true">👥 </span>Team ({memberCount})
        </button>
        <button style={styles.primaryButton} onClick={onNewTask}>
          + New Task
        </button>
      </div>
    </header>
  );
}
