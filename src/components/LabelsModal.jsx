import { useId, useState } from "react";
import { LABEL_COLORS } from "../lib/constants";
import { cx } from "../lib/utils";
import ui from "./ui.module.css";
import { LabelBadge } from "./Badges";
import ColorSwatches from "./ColorSwatches";
import Modal from "./Modal";

export default function LabelsModal({ labels, onAdd, onDelete, onClose }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(LABEL_COLORS[0]);
  const id = useId();

  async function handleSubmit(e) {
    e.preventDefault();
    if (await onAdd({ name, color })) setName("");
  }

  function handleDelete(label) {
    if (
      window.confirm(
        `Delete the "${label.name}" label? It will be removed from every task.`,
      )
    ) {
      onDelete(label);
    }
  }

  return (
    <Modal title="Manage Labels" onClose={onClose}>
      <form onSubmit={handleSubmit} className={cx(ui.form, ui.manageForm)}>
        <div className={ui.fieldGroup}>
          <label htmlFor={`${id}-name`} className={ui.label}>
            Label Name *
          </label>
          <input
            id={`${id}-name`}
            data-autofocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Bug, Feature, Urgent"
            required
            className={ui.input}
          />
        </div>
        <div className={ui.fieldGroup}>
          <span id={`${id}-color`} className={ui.label}>
            Color
          </span>
          <ColorSwatches
            colors={LABEL_COLORS}
            value={color}
            onChange={setColor}
            labelId={`${id}-color`}
          >
            <button
              type="submit"
              className={cx(ui.primaryButton, ui.inlineSubmit)}
            >
              + Add Label
            </button>
          </ColorSwatches>
        </div>
      </form>
      <hr className={ui.divider} />
      <div className={ui.list}>
        {labels.map((l) => (
          <div key={l.id} className={ui.listItem}>
            <LabelBadge label={l} large />
            <button
              type="button"
              onClick={() => handleDelete(l)}
              className={cx(ui.iconButton, ui.danger)}
              aria-label={`Delete label ${l.name}`}
            >
              ×
            </button>
          </div>
        ))}
        {labels.length === 0 && (
          <p className={ui.emptyText}>No labels created yet.</p>
        )}
      </div>
    </Modal>
  );
}
