import css from "./Toast.module.css";

export default function Toast({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div role="alert" className={css.toast}>
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className={css.dismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
