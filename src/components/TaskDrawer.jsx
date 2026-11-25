import { useId, useState } from "react";
import { useDialog } from "../hooks/useDialog";
import { formatTime } from "../lib/utils";
import { styles } from "../styles";
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
    <div style={styles.drawerOverlay} onClick={close}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-heading`}
        tabIndex={-1}
        style={styles.drawerContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.drawerHeader}>
          <h2 id={`${id}-heading`} style={styles.drawerHeaderTitle}>
            Task Details
          </h2>
          <button
            type="button"
            onClick={close}
            style={styles.closeButton}
            aria-label="Close task details"
          >
            ×
          </button>
        </div>
        <div style={styles.drawerBody}>
          <div style={styles.fieldGroup}>
            <label htmlFor={`${id}-title`} style={styles.label}>
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
              style={styles.input}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label htmlFor={`${id}-description`} style={styles.label}>
              Description
            </label>
            <textarea
              id={`${id}-description`}
              value={task.description || ""}
              onChange={(e) => editField("description", e.target.value)}
              onBlur={(e) => saveField("description", e.target.value)}
              rows={3}
              style={styles.textarea}
            />
          </div>

          <div style={styles.fieldGroup}>
            <span id={`${id}-labels`} style={styles.label}>
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

          <hr style={styles.divider} />
          <section aria-labelledby={`${id}-comments`}>
            <h3 id={`${id}-comments`} style={styles.sectionTitle}>
              Comments ({comments.length})
            </h3>
            {comments.length > 0 && (
              <ul style={styles.commentsList}>
                {comments.map((c) => (
                  <li key={c.id} style={styles.commentItem}>
                    <p style={styles.commentBody}>{c.body}</p>
                    <time dateTime={c.created_at} style={styles.commentDate}>
                      {formatTime(c.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
            {comments.length === 0 && (
              <p style={{ ...styles.emptyText, marginBottom: "0.75rem" }}>
                No comments yet.
              </p>
            )}
            <form onSubmit={handleAddComment} style={styles.commentForm}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                aria-label="New comment"
                style={styles.input}
              />
              <button type="submit" style={styles.secondaryButton}>
                Send
              </button>
            </form>
          </section>

          <hr style={styles.divider} />
          <section aria-labelledby={`${id}-activity`}>
            <h3 id={`${id}-activity`} style={styles.sectionTitle}>
              Activity Log
            </h3>
            <ul style={styles.activityList}>
              {activityLogs.map((log) => (
                <li key={log.id} style={styles.activityItem}>
                  <span style={styles.activityText}>
                    <span aria-hidden="true">• </span>
                    {log.details}
                  </span>
                  <time dateTime={log.created_at} style={styles.activityDate}>
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
