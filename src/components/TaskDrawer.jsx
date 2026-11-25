import { useState } from "react";
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

  async function handleAddComment(e) {
    e.preventDefault();
    if (await addComment(newComment)) setNewComment("");
  }

  return (
    <div style={styles.drawerOverlay} onClick={close}>
      <div style={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.drawerHeader}>
          <h2 style={styles.drawerHeaderTitle}>Task Details</h2>
          <button onClick={close} style={styles.closeButton}>
            ×
          </button>
        </div>
        <div style={styles.drawerBody}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Title</label>
            <input
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
            <label style={styles.label}>Description</label>
            <textarea
              value={task.description || ""}
              onChange={(e) => editField("description", e.target.value)}
              onBlur={(e) => saveField("description", e.target.value)}
              rows={3}
              style={styles.textarea}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Labels</label>
            <LabelPicker
              labels={labels}
              selectedIds={labelIds}
              onToggle={toggleLabel}
              emptyText="No labels created yet. Add them via the 🏷️ Labels button."
            />
          </div>

          <TaskMetaFields
            values={task}
            teamMembers={teamMembers}
            onChange={saveField}
          />

          <hr style={styles.divider} />
          <div>
            <h3 style={styles.sectionTitle}>Comments ({comments.length})</h3>
            <div style={styles.commentsList}>
              {comments.map((c) => (
                <div key={c.id} style={styles.commentItem}>
                  <p style={styles.commentBody}>{c.body}</p>
                  <span style={styles.commentDate}>
                    {formatTime(c.created_at)}
                  </span>
                </div>
              ))}
              {comments.length === 0 && (
                <p style={styles.emptyText}>No comments yet.</p>
              )}
            </div>
            <form onSubmit={handleAddComment} style={styles.commentForm}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                style={styles.input}
              />
              <button type="submit" style={styles.secondaryButton}>
                Send
              </button>
            </form>
          </div>

          <hr style={styles.divider} />
          <div>
            <h3 style={styles.sectionTitle}>Activity Log</h3>
            <div style={styles.activityList}>
              {activityLogs.map((log) => (
                <div key={log.id} style={styles.activityItem}>
                  <span style={styles.activityText}>• {log.details}</span>
                  <span style={styles.activityDate}>
                    {formatTime(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
