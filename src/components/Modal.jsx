import { useId } from "react";
import { useDialog } from "../hooks/useDialog";
import { cx } from "../lib/utils";
import css from "./Modal.module.css";
import ui from "./ui.module.css";

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
      className={css.overlay}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={css.content}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={css.header}>
          <h2 id={titleId} className={css.title}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={cx(ui.iconButton, ui.closeButton)}
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
