import { COLUMNS, PRIORITIES } from "../lib/constants";
import { styles } from "../styles";

// Status, priority, assignee and due date inputs, shared by the new-task form
// and the task drawer. `values` uses the task's column names.
export default function TaskMetaFields({ values, teamMembers, onChange }) {
  return (
    <>
      <div style={styles.rowGroup}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Status</label>
          <select
            value={values.status}
            onChange={(e) => onChange("status", e.target.value)}
            style={styles.input}
          >
            {COLUMNS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Priority</label>
          <select
            value={values.priority}
            onChange={(e) => onChange("priority", e.target.value)}
            style={styles.input}
          >
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={styles.rowGroup}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Assignee</label>
          <select
            value={values.assignee_id || ""}
            onChange={(e) => onChange("assignee_id", e.target.value)}
            style={styles.input}
          >
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Due Date</label>
          <input
            type="date"
            value={values.due_date || ""}
            onChange={(e) => onChange("due_date", e.target.value)}
            style={styles.input}
          />
        </div>
      </div>
    </>
  );
}
