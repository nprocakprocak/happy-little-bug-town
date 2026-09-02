import { useCallback, useEffect, useState } from "react";

const TYPEWRITER_INTERVAL_MS = 18;

export function useTypedText(text: string) {
  const [revealedLength, setRevealedLength] = useState(0);

  useEffect(() => {
    setRevealedLength(0);
  }, [text]);

  useEffect(() => {
    if (revealedLength >= text.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRevealedLength((current) => current + 1);
    }, TYPEWRITER_INTERVAL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [revealedLength, text]);

  const showAll = useCallback(() => {
    setRevealedLength(text.length);
  }, [text.length]);

  return {
    displayedText: text.slice(0, Math.min(revealedLength, text.length)),
    isComplete: revealedLength >= text.length,
    showAll,
  };
}
