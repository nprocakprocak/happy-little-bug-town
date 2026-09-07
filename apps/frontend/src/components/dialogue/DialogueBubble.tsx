"use client";

import Image from "next/image";

import { useDialoguePages } from "../../hooks/useDialoguePages";
import { Dialogue } from "../../types/dialogue";
import { bugTypeToBustSrc } from "../helpers/characterImages";

interface DialogueBubbleProps {
  dialogue: Dialogue;
  onClose: () => void;
}

const DIALOGUE_TEXT_CLASS_NAME = "text-[clamp(0.95rem,4.2cqi,1.35rem)] leading-snug text-stone-800";

export function DialogueBubble({ dialogue, onClose }: DialogueBubbleProps) {
  const { text, bugType, infographic } = dialogue;
  const bustSrc = bugType ? bugTypeToBustSrc(bugType) : undefined;
  const {
    containerRef,
    measureRef,
    displayedText,
    isComplete,
    hasMore,
    hasMultiplePages,
    showAll,
    showNext,
  } = useDialoguePages(text);

  return (
    <div className="absolute inset-0" role="presentation">
      <div
        className={`absolute inset-x-0 bottom-0 px-[3cqi] pb-[3cqi] ${
          bustSrc || infographic ? "pt-[34cqi]" : ""
        }`}
      >
        <div className="relative">
          {bustSrc ? (
            <div className="absolute bottom-full left-[2cqi] h-[42cqi] w-[42cqi]">
              <Image
                src={bustSrc}
                alt=""
                fill
                className="object-contain object-bottom"
                sizes="42cqi"
              />
            </div>
          ) : null}
          {infographic ? (
            <div
              className={`absolute bottom-full mb-[2cqi] w-[48cqi] overflow-hidden rounded-[4cqi] border-2 border-stone-200 bg-white shadow-[0_8px_0_rgba(0,0,0,0.12),0_16px_28px_rgba(0,0,0,0.28)] ${
                bustSrc ? "right-[2cqi]" : "left-1/2 -translate-x-1/2"
              }`}
            >
              {infographic}
            </div>
          ) : null}
          <div
            className={`relative rounded-[5cqi] border-2 border-stone-200 bg-stone-50 px-[5cqi] py-[4cqi] pr-[12cqi] shadow-[0_8px_0_rgba(0,0,0,0.12),0_16px_28px_rgba(0,0,0,0.28)] ${
              isComplete ? "" : "cursor-pointer"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={text}
            onClick={isComplete ? undefined : showAll}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              className="absolute top-[1.5cqi] right-[2cqi] flex h-[8cqi] w-[8cqi] cursor-pointer items-center justify-center text-[clamp(1.25rem,6cqi,1.85rem)] leading-none font-bold text-stone-500 transition-colors hover:text-stone-800"
            >
              ×
            </button>
            <div ref={containerRef} className="relative">
              <p
                ref={measureRef}
                className={`pointer-events-none invisible absolute w-full ${DIALOGUE_TEXT_CLASS_NAME}`}
                aria-hidden="true"
              />
              <p className={`h-[3lh] overflow-hidden ${DIALOGUE_TEXT_CLASS_NAME}`}>
                {displayedText}
              </p>
              {hasMultiplePages ? (
                <div className="mt-[1cqi] flex justify-end">
                  <button
                    type="button"
                    disabled={!hasMore || !isComplete}
                    onClick={(event) => {
                      event.stopPropagation();
                      showNext();
                    }}
                    className={`flex items-center gap-[0.4cqi] text-[clamp(0.85rem,3.6cqi,1.1rem)] text-stone-800 hover:underline underline-offset-2 ${
                      hasMore && isComplete ? "cursor-pointer" : "invisible"
                    }`}
                  >
                    More 🡆
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
