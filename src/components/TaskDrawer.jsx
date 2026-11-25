import { useId, useState } from "react";
import { useDialog } from "../hooks/useDialog";
import { cx, formatTime } from "../lib/utils";
import css from "./TaskDrawer.module.css";
import ui from "./ui.module.css";
import LabelPicker from "./LabelPicker";
import TaskMetaFields from "./TaskMetaFields";

// Slide-over panel for one task. `detail` comes from useTaskDetail.
export default function TaskDrawer({ detail, labels, teamMembers, labelIds }) {
  const {
    selectedTask: task,
    comments,
    activityLogs,
    close,
    editField,
    saveField,
    toggleLabel,
    addComment,
  } = detail;
  const [newComment, setNewComment] = useState("");
  const dialogRef = useDialog(close);
  const id = useId();

  async function handleAddComment(e) {
    e.preventDefault();
    if (await addComment(newComment)) setNewComment("");
  }

  return (
    <div className={css.overlay} onClick={close}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-heading`}
        tabIndex={-1}
        className={css.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={css.header}>
          <h2 id={`${id}-heading`} className={css.title}>
            Task Details
          </h2>
          <button
            type="button"
            onClick={close}
            className={cx(ui.iconButton, ui.closeButton)}
            aria-label="Close task details"
          >
            ×
          </button>
        </div>
        <div className={css.body}>
          <div className={ui.fieldGroup}>
            <label htmlFor={`${id}-title`} className={ui.label}>
              Title
            </label>
            <input
              id={`${id}-title`}
              type="text"
              value={task.title}
              onChange={(e) => editField("title", e.target.value)}
              onBlur={(e) => saveField("title", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className={ui.input}
            />
          </div>
          <div className={ui.fieldGroup}>
            <label htmlFor={`${id}-description`} className={ui.label}>
              Description
            </label>
            <textarea
              id={`${id}-description`}
              value={task.description || ""}
              onChange={(e) => editField("description", e.target.value)}
              onBlur={(e) => saveField("description", e.target.value)}
              rows={3}
              className={ui.textarea}
            />
          </div>

          <div className={ui.fieldGroup}>
            <span id={`${id}-labels`} className={ui.label}>
              Labels
            </span>
            <LabelPicker
              labelId={`${id}-labels`}
              labels={labels}
              selectedIds={labelIds}
              onToggle={toggleLabel}
              emptyText="No labels created yet. Add them via the Labels button."
            />
          </div>

          <TaskMetaFields
            values={task}
            teamMembers={teamMembers}
            onChange={saveField}
          />

          <hr className={ui.divider} />
          <section aria-labelledby={`${id}-comments`}>
            <h3 id={`${id}-comments`} className={css.sectionTitle}>
              Comments ({comments.length})
            </h3>
            {comments.length > 0 && (
              <ul className={css.comments}>
                {comments.map((c) => (
                  <li key={c.id} className={css.comment}>
                    <p className={css.commentBody}>{c.body}</p>
                    <time dateTime={c.created_at} className={css.commentDate}>
                      {formatTime(c.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
            {comments.length === 0 && (
              <p className={cx(ui.emptyText, css.noComments)}>
                No comments yet.
              </p>
            )}
            <form onSubmit={handleAddComment} className={css.commentForm}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                aria-label="New comment"
                className={ui.input}
              />
              <button type="submit" className={ui.secondaryButton}>
                Send
              </button>
            </form>
          </section>

          <hr className={ui.divider} />
          <section aria-labelledby={`${id}-activity`}>
            <h3 id={`${id}-activity`} className={css.sectionTitle}>
              Activity Log
            </h3>
            <ul className={css.activity}>
              {activityLogs.map((log) => (
                <li key={log.id} className={css.activityItem}>
                  <span className={css.activityText}>
                    <span aria-hidden="true">• </span>
                    {log.details}
                  </span>
                  <time dateTime={log.created_at} className={css.activityDate}>
                    {formatTime(log.created_at)}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
