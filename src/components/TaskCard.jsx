import { PRIORITIES } from "../lib/constants";
import { getDueDateStatus } from "../lib/utils";
import { styles } from "../styles";
import { Avatar, LabelBadge } from "./Badges";

const PRIORITY_STYLE = Object.fromEntries(PRIORITIES.map((p) => [p.id, p]));

export default function TaskCard({
  task,
  assignee,
  labels,
  onOpen,
  onDelete,
  onDragStart,
}) {
  const dueInfo = getDueDateStatus(task.due_date, task.status);
  const priority = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.normal;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      onKeyDown={(e) => {
        // Ignore keys from the delete button inside the card.
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open task: ${task.title}`}
      style={{
        ...styles.card,
        borderLeft:
          dueInfo?.type === "overdue" ? "3px solid #ef4444" : "1px solid #374151",
      }}
    >
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.priorityBadge,
            backgroundColor: priority.bg,
            color: priority.color,
          }}
        >
          {task.priority}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={styles.deleteBtn}
          title="Delete task"
          aria-label={`Delete task: ${task.title}`}
        >
          ×
        </button>
      </div>

      {labels.length > 0 && (
        <div style={styles.cardLabelsRow}>
          {labels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      )}

      <h4 style={styles.cardTitle}>{task.title}</h4>
      {task.description && <p style={styles.cardDesc}>{task.description}</p>}

      {(dueInfo || assignee) && (
        <div style={styles.cardFooter}>
          <div>
            {dueInfo && (
              <span
                style={{
                  ...styles.dueBadge,
                  backgroundColor: dueInfo.bg,
                  color: dueInfo.color,
                  border: `1px solid ${dueInfo.border}`,
                }}
              >
                <span aria-hidden="true">📅 </span>
                {dueInfo.label}
              </span>
            )}
          </div>
          {assignee && (
            <Avatar member={assignee} title={`Assigned to ${assignee.name}`} />
          )}
        </div>
      )}
    </div>
  );
}
