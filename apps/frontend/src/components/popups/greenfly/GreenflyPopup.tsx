"use client";

import { GREENFLY_MAX_LEAF_PARTS } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { BugHungryPopupContent } from "../shared/BugHungryPopupContent";
import { GridPopup } from "../shared/GridPopup";

interface GreenflyPopupProps {
  greenfly: Bug;
  onClose: () => void;
}

export function GreenflyPopup({ greenfly, onClose }: GreenflyPopupProps) {
  return (
    <GridPopup>
      <BugHungryPopupContent
        bug={greenfly}
        foodItemType="leaf_part"
        maxCount={GREENFLY_MAX_LEAF_PARTS}
        message="We must fatten up this greenfly before cooking"
        onClose={onClose}
      />
    </GridPopup>
  );
}
