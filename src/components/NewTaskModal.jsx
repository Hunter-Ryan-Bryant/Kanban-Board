import { useId, useState } from "react";
import ui from "./ui.module.css";
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
      <form onSubmit={handleSubmit} className={ui.form}>
        <div className={ui.fieldGroup}>
          <label htmlFor={`${id}-title`} className={ui.label}>
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
            className={ui.input}
          />
        </div>
        <div className={ui.fieldGroup}>
          <label htmlFor={`${id}-description`} className={ui.label}>
            Description
          </label>
          <textarea
            id={`${id}-description`}
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            className={ui.textarea}
            placeholder="Details..."
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
            emptyText="No labels available. Create them in the top header."
          />
        </div>

        <TaskMetaFields
          values={values}
          teamMembers={teamMembers}
          onChange={setField}
        />

        <div className={ui.modalActions}>
          <button type="button" onClick={onClose} className={ui.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={ui.primaryButton}>
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
