"use client";

import { SPIDER_MAX_STUFFED_FLIES } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { BugHungryPopupContent } from "../shared/BugHungryPopupContent";
import { GridPopup } from "../shared/GridPopup";

interface SpiderPopupProps {
  spider: Bug;
  onClose: () => void;
}

export function SpiderPopup({ spider, onClose }: SpiderPopupProps) {
  return (
    <GridPopup onClose={onClose}>
      <BugHungryPopupContent
        bug={spider}
        foodItemType="stuffed_fly"
        maxCount={SPIDER_MAX_STUFFED_FLIES}
        onClose={onClose}
      />
    </GridPopup>
  );
}
