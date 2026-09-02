"use client";

import { ANT_MAX_NETTLE_SOUP } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { BugHungryPopupContent } from "../shared/BugHungryPopupContent";
import { GridPopup } from "../shared/GridPopup";

interface AntPopupProps {
  ant: Bug;
  onClose: () => void;
}

export function AntPopup({ ant, onClose }: AntPopupProps) {
  return (
    <GridPopup onClose={onClose}>
      <BugHungryPopupContent
        bug={ant}
        foodItemType="nettle_soup"
        maxCount={ANT_MAX_NETTLE_SOUP}
        onClose={onClose}
      />
    </GridPopup>
  );
}
