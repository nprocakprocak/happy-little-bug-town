import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { splitTextToPages } from "../components/helpers/splitTextToPages";
import { useTypedText } from "./useTypedText";

const DIALOGUE_VISIBLE_LINES = 3;

function pagesAreEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((page, index) => page === right[index]);
}

export function useDialoguePages(text: string) {
  const measureRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([text]);
  const [pageIndex, setPageIndex] = useState(0);

  useLayoutEffect(() => {
    const measureEl = measureRef.current;
    const containerEl = containerRef.current;
    if (!measureEl) {
      return;
    }

    function applyPages(resetIndex: boolean, el: HTMLElement) {
      const nextPages = splitTextToPages(text, el, DIALOGUE_VISIBLE_LINES);
      setPages((current) => (pagesAreEqual(current, nextPages) ? current : nextPages));
      if (resetIndex) {
        setPageIndex(0);
      } else {
        setPageIndex((current) => Math.min(current, nextPages.length - 1));
      }
    }

    applyPages(true, measureEl);

    if (!containerEl) {
      return;
    }

    const observer = new ResizeObserver(() => {
      applyPages(false, measureEl);
    });
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [text]);

  const pageText = pages[pageIndex] ?? "";
  const { displayedText, isComplete, showAll } = useTypedText(pageText);
  const hasPrev = pageIndex > 0;
  const hasMore = pageIndex < pages.length - 1;
  const hasMultiplePages = pages.length > 1;

  const showPrev = useCallback(() => {
    setPageIndex((current) => Math.max(current - 1, 0));
  }, []);

  const showNext = useCallback(() => {
    setPageIndex((current) => current + 1);
  }, []);

  return {
    containerRef,
    measureRef,
    displayedText,
    isComplete,
    hasPrev,
    hasMore,
    hasMultiplePages,
    showAll,
    showPrev,
    showNext,
  };
}
