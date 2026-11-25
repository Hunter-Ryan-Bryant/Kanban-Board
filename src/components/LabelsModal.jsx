import { useId, useState } from "react";
import { LABEL_COLORS } from "../lib/constants";
import { styles } from "../styles";
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
      <form
        onSubmit={handleSubmit}
        style={{ ...styles.form, marginBottom: "1.25rem" }}
      >
        <div style={styles.fieldGroup}>
          <label htmlFor={`${id}-name`} style={styles.label}>
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
            style={styles.input}
          />
        </div>
        <div style={styles.fieldGroup}>
          <span id={`${id}-color`} style={styles.label}>
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
              style={{
                ...styles.primaryButton,
                marginLeft: "auto",
                padding: "0.45rem 1rem",
              }}
            >
              + Add Label
            </button>
          </ColorSwatches>
        </div>
      </form>
      <hr style={styles.divider} />
      <div style={styles.memberList}>
        {labels.map((l) => (
          <div key={l.id} style={styles.memberItem}>
            <LabelBadge
              label={l}
              style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
            />
            <button
              type="button"
              onClick={() => handleDelete(l)}
              style={styles.deleteBtn}
              aria-label={`Delete label ${l.name}`}
            >
              ×
            </button>
          </div>
        ))}
        {labels.length === 0 && (
          <p style={styles.emptyText}>No labels created yet.</p>
        )}
      </div>
    </Modal>
  );
}
