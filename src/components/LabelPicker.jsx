import { styles } from "../styles";

// Toggle buttons for attaching labels, used by the new-task form and drawer.
export default function LabelPicker({ labels, selectedIds, onToggle, emptyText }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.375rem",
        marginTop: "0.25rem",
      }}
    >
      {labels.map((l) => {
        const isSelected = selectedIds.includes(l.id);
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onToggle(l.id)}
            style={{
              backgroundColor: isSelected ? `${l.color}35` : "#1f2937",
              color: isSelected ? l.color : "#94a3b8",
              border: `1px solid ${isSelected ? l.color : "#374151"}`,
              padding: "0.25rem 0.625rem",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {isSelected ? "✓ " : "+ "}
            {l.name}
          </button>
        );
      })}
      {labels.length === 0 && <span style={styles.emptyText}>{emptyText}</span>}
    </div>
  );
}
