"use client";

import { BEETLE_MAX_LEAF_PARTS, isBugFed } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { Structure } from "../../../types/structure";
import { BugHungryPopupContent } from "../shared/BugHungryPopupContent";
import { GridPopup } from "../shared/GridPopup";
import { BeetleBuildPopupContent } from "./BeetleBuildPopupContent";

interface BeetlePopupProps {
  beetle: Bug;
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function BeetlePopup({ beetle, structures, onClose, onBuild }: BeetlePopupProps) {
  return (
    <GridPopup onClose={onClose}>
      {isBugFed(beetle) ? (
        <BeetleBuildPopupContent structures={structures} onClose={onClose} onBuild={onBuild} />
      ) : (
        <BugHungryPopupContent
          bug={beetle}
          foodItemType="leaf_part"
          maxCount={BEETLE_MAX_LEAF_PARTS}
          onClose={onClose}
        />
      )}
    </GridPopup>
  );
}
