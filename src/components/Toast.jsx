import { styles } from "../styles";

export default function Toast({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div role="alert" style={styles.toast}>
      <span>{message}</span>
      <button onClick={onDismiss} style={styles.toastClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
