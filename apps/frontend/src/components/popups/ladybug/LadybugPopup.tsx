"use client";

import { isBugFed, LADYBUG_MAX_GRILLED_GREENFLIES } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { Structure } from "../../../types/structure";
import { BugHungryPopupContent } from "../shared/BugHungryPopupContent";
import { GridPopup } from "../shared/GridPopup";
import { LadybugUpgradePopupContent } from "./LadybugUpgradePopupContent";

interface LadybugPopupProps {
  ladybug: Bug;
  structures: Structure[];
  onClose: () => void;
  onUpgrade: (structure: Structure) => void;
}

export function LadybugPopup({ ladybug, structures, onClose, onUpgrade }: LadybugPopupProps) {
  return (
    <GridPopup onClose={onClose}>
      {isBugFed(ladybug) ? (
        <LadybugUpgradePopupContent
          structures={structures}
          onClose={onClose}
          onUpgrade={onUpgrade}
        />
      ) : (
        <BugHungryPopupContent
          bug={ladybug}
          foodItemType="grilled_greenflies"
          maxCount={LADYBUG_MAX_GRILLED_GREENFLIES}
          onClose={onClose}
        />
      )}
    </GridPopup>
  );
}
