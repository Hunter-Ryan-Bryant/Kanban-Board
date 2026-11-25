import { styles } from "../styles";

export default function Modal({
  title,
  onClose,
  closeOnOverlayClick = true,
  children,
}) {
  return (
    <div
      style={styles.modalOverlay}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
