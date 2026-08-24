"use client";

import { TERMITE_MAX_PASTA } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { BugHungryPopupContent } from "../shared/BugHungryPopupContent";
import { GridPopup } from "../shared/GridPopup";

interface TermitePopupProps {
  termite: Bug;
  onClose: () => void;
}

export function TermitePopup({ termite, onClose }: TermitePopupProps) {
  return (
    <GridPopup>
      <BugHungryPopupContent
        bug={termite}
        foodItemType="pasta"
        maxCount={TERMITE_MAX_PASTA}
        onClose={onClose}
      />
    </GridPopup>
  );
}
