import { useId } from "react";
import { useDialog } from "../hooks/useDialog";
import { styles } from "../styles";

export default function Modal({
  title,
  onClose,
  closeOnOverlayClick = true,
  children,
}) {
  const dialogRef = useDialog(onClose);
  const titleId = useId();

  return (
    <div
      style={styles.modalOverlay}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <h2 id={titleId} style={styles.modalTitle}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
