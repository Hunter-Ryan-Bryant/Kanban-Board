import { useId } from "react";
import { COLUMNS, PRIORITIES } from "../lib/constants";
import ui from "./ui.module.css";

// Status, priority, assignee and due date inputs, shared by the new-task form
// and the task drawer. `values` uses the task's column names.
export default function TaskMetaFields({ values, teamMembers, onChange }) {
  const id = useId();

  return (
    <>
      <div className={ui.rowGroup}>
        <div className={ui.fieldGroup}>
          <label htmlFor={`${id}-status`} className={ui.label}>
            Status
          </label>
          <select
            id={`${id}-status`}
            value={values.status}
            onChange={(e) => onChange("status", e.target.value)}
            className={ui.input}
          >
            {COLUMNS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className={ui.fieldGroup}>
          <label htmlFor={`${id}-priority`} className={ui.label}>
            Priority
          </label>
          <select
            id={`${id}-priority`}
            value={values.priority}
            onChange={(e) => onChange("priority", e.target.value)}
            className={ui.input}
          >
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={ui.rowGroup}>
        <div className={ui.fieldGroup}>
          <label htmlFor={`${id}-assignee`} className={ui.label}>
            Assignee
          </label>
          <select
            id={`${id}-assignee`}
            value={values.assignee_id || ""}
            onChange={(e) => onChange("assignee_id", e.target.value)}
            className={ui.input}
          >
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className={ui.fieldGroup}>
          <label htmlFor={`${id}-due`} className={ui.label}>
            Due Date
          </label>
          <input
            id={`${id}-due`}
            type="date"
            value={values.due_date || ""}
            onChange={(e) => onChange("due_date", e.target.value)}
            className={ui.input}
          />
        </div>
      </div>
    </>
  );
}
