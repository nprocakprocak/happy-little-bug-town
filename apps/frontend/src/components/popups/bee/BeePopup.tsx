"use client";

import { BEE_MAX_FLOWERS } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { BugHungryPopupContent } from "../shared/BugHungryPopupContent";
import { GridPopup } from "../shared/GridPopup";

interface BeePopupProps {
  bee: Bug;
  onClose: () => void;
}

export function BeePopup({ bee, onClose }: BeePopupProps) {
  return (
    <GridPopup onClose={onClose}>
      <BugHungryPopupContent
        bug={bee}
        foodItemType="flower"
        maxCount={BEE_MAX_FLOWERS}
        onClose={onClose}
      />
    </GridPopup>
  );
}
