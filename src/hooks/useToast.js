import { useCallback, useEffect, useRef, useState } from "react";

// A single dismissible message that clears itself after `timeoutMs`.
export function useToast(timeoutMs = 6000) {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setMessage(null);
  }, []);

  const notify = useCallback(
    (text) => {
      setMessage(text);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setMessage(null), timeoutMs);
    },
    [timeoutMs],
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { message, notify, dismiss };
}
