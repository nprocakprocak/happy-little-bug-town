"use client";

import { BEETLE_MAX_LEAF_PARTS } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { Structure } from "../../../types/structure";
import { GridPopup } from "../shared/GridPopup";
import { BeetleBuildPopupContent } from "./BeetleBuildPopupContent";
import { BeetleHungryPopupContent } from "./BeetleHungryPopupContent";

interface BeetlePopupProps {
  beetle: Bug;
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function BeetlePopup({ beetle, structures, onClose, onBuild }: BeetlePopupProps) {
  const isFed = beetle.items.length >= BEETLE_MAX_LEAF_PARTS;

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
