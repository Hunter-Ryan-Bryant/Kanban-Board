import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Keyboard behavior for a modal dialog: moves focus into it on open (to the
// element marked `data-autofocus`, else the dialog itself), keeps Tab inside
// it, closes on Escape, and returns focus to where it was on close.
// Attach the returned ref to the dialog element and give it tabIndex={-1}.
export function useDialog(onClose) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement;
    (dialog.querySelector("[data-autofocus]") ?? dialog).focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        // Blur first so a text field with unsaved edits fires its onBlur save.
        if (dialog.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = [...dialog.querySelectorAll(FOCUSABLE)];
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return dialogRef;
}
