import { useId, useState } from "react";
import { styles } from "../styles";
import LabelPicker from "./LabelPicker";
import Modal from "./Modal";
import TaskMetaFields from "./TaskMetaFields";

const EMPTY_TASK = {
  title: "",
  description: "",
  status: "todo",
  priority: "normal",
  assignee_id: "",
  due_date: "",
};

export default function NewTaskModal({ labels, teamMembers, onCreate, onClose }) {
  const [values, setValues] = useState(EMPTY_TASK);
  const [labelIds, setLabelIds] = useState([]);
  const id = useId();

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function toggleLabel(labelId) {
    setLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((x) => x !== labelId)
        : [...prev, labelId],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (await onCreate(values, labelIds)) onClose();
  }

  // Clicking the backdrop doesn't close this one, so a half-written task
  // isn't lost by accident.
  return (
    <Modal title="Create New Task" onClose={onClose} closeOnOverlayClick={false}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldGroup}>
          <label htmlFor={`${id}-title`} style={styles.label}>
            Task Title *
          </label>
          <input
            id={`${id}-title`}
            data-autofocus
            type="text"
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Task title..."
            required
            style={styles.input}
          />
        </div>
        <div style={styles.fieldGroup}>
          <label htmlFor={`${id}-description`} style={styles.label}>
            Description
          </label>
          <textarea
            id={`${id}-description`}
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            style={styles.textarea}
            placeholder="Details..."
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
            emptyText="No labels available. Create them in the top header."
          />
        </div>

        <TaskMetaFields
          values={values}
          teamMembers={teamMembers}
          onChange={setField}
        />

        <div style={styles.modalActions}>
          <button type="button" onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" style={styles.primaryButton}>
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
