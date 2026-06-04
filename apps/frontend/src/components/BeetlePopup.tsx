"use client";

import { BEETLE_MAX_LEAF_PARTS } from "../constants";
import { Bug } from "../types/bug";
import { Structure } from "../types/structure";
import { BeetleBuildPopupContent } from "./BeetleBuildPopupContent";
import { BeetleHungryPopupContent } from "./BeetleHungryPopupContent";

interface BeetlePopupProps {
  beetle: Bug;
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function BeetlePopup({ beetle, structures, onClose, onBuild }: BeetlePopupProps) {
  const isFed = beetle.itemIds.length >= BEETLE_MAX_LEAF_PARTS;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <div
        className="flex w-[84%] max-h-[84%] max-w-full flex-col overflow-y-auto rounded-lg bg-stone-50 shadow-lg"
        role="dialog"
        aria-modal="true"
      >
        {isFed ? (
          <BeetleBuildPopupContent structures={structures} onClose={onClose} onBuild={onBuild} />
        ) : (
          <BeetleHungryPopupContent beetle={beetle} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
