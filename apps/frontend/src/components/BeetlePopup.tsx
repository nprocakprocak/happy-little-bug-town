"use client";

import { BEETLE_MAX_LEAF_PARTS } from "@happy-little-park/utils";

import { Bug } from "../types/bug";
import { Structure } from "../types/structure";
import { BeetleBuildPopupContent } from "./BeetleBuildPopupContent";
import { BeetleHungryPopupContent } from "./BeetleHungryPopupContent";
import { GridPopup } from "./GridPopup";

interface BeetlePopupProps {
  beetle: Bug;
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function BeetlePopup({ beetle, structures, onClose, onBuild }: BeetlePopupProps) {
  const isFed = beetle.itemIds.length >= BEETLE_MAX_LEAF_PARTS;

  return (
    <GridPopup>
      {isFed ? (
        <BeetleBuildPopupContent structures={structures} onClose={onClose} onBuild={onBuild} />
      ) : (
        <BeetleHungryPopupContent beetle={beetle} onClose={onClose} />
      )}
    </GridPopup>
  );
}
