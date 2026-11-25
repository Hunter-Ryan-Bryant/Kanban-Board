import { cx, getDueDateStatus } from "../lib/utils";
import { Avatar, LabelBadge } from "./Badges";
import css from "./TaskCard.module.css";
import ui from "./ui.module.css";

export default function TaskCard({
  task,
  assignee,
  labels,
  onOpen,
  onDelete,
  onDragStart,
}) {
  const dueInfo = getDueDateStatus(task.due_date, task.status);

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
      className={cx(css.card, dueInfo?.type === "overdue" && css.overdue)}
    >
      <div className={css.header}>
        <span className={css.priority} data-priority={task.priority}>
          {task.priority}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={cx(ui.iconButton, ui.danger)}
          title="Delete task"
          aria-label={`Delete task: ${task.title}`}
        >
          ×
        </button>
      </div>

      {labels.length > 0 && (
        <div className={css.labels}>
          {labels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      )}

      <h3 className={css.title}>{task.title}</h3>
      {task.description && (
        <p className={css.description}>{task.description}</p>
      )}

      {(dueInfo || assignee) && (
        <div className={css.footer}>
          <div>
            {dueInfo && (
              <span className={css.due} data-type={dueInfo.type}>
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
