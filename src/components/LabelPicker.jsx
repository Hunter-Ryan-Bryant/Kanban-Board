import css from "./LabelPicker.module.css";
import ui from "./ui.module.css";

// Toggle buttons for attaching labels, used by the new-task form and drawer.
// `labelId` names the group.
export default function LabelPicker({
  labels,
  selectedIds,
  onToggle,
  emptyText,
  labelId,
}) {
  return (
    <div role="group" aria-labelledby={labelId} className={css.group}>
      {labels.map((l) => {
        const isSelected = selectedIds.includes(l.id);
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onToggle(l.id)}
            aria-pressed={isSelected}
            className={css.toggle}
            style={{ "--label": l.color }}
          >
            <span aria-hidden="true">{isSelected ? "✓ " : "+ "}</span>
            {l.name}
          </button>
        );
      })}
      {labels.length === 0 && <span className={ui.emptyText}>{emptyText}</span>}
    </div>
  );
}
