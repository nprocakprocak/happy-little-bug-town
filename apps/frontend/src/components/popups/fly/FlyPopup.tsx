"use client";

import { FLY_MAX_ROTTEN_APPLES } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { BugHungryPopupContent } from "../shared/BugHungryPopupContent";
import { GridPopup } from "../shared/GridPopup";

interface FlyPopupProps {
  fly: Bug;
  onClose: () => void;
}

export function FlyPopup({ fly, onClose }: FlyPopupProps) {
  return (
    <GridPopup onClose={onClose}>
      <BugHungryPopupContent
        bug={fly}
        foodItemType="rotten_apple"
        maxCount={FLY_MAX_ROTTEN_APPLES}
        onClose={onClose}
      />
    </GridPopup>
  );
}
