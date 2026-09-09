"use client";

import { ReactNode } from "react";
import { ItemType } from "@happy-little-bug-town/utils";

import { PopupActionFooter } from "./PopupActionFooter";
import { PopupResourceCosts } from "./PopupResourceCosts";

interface SelectionPopupContentProps {
  slider: ReactNode;
  itemCosts: { itemType: ItemType; count: number }[];
  primaryLabel: string;
  onPrimaryClick: () => void;
  onClose: () => void;
  primaryDisabled?: boolean;
  description?: string;
}

export function SelectionPopupContent({
  slider,
  itemCosts,
  primaryLabel,
  onPrimaryClick,
  onClose,
  primaryDisabled,
  description,
}: SelectionPopupContentProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-[3cqi] px-[4cqi] pt-[4cqi] pb-[2cqi]">
        {slider}
        <PopupResourceCosts itemCosts={itemCosts} />
        {description ? (
          <p className="text-center text-[clamp(0.75rem,3.2cqi,1.1rem)] leading-snug text-stone-600">
            {description}
          </p>
        ) : null}
      </div>
      <PopupActionFooter
        primaryLabel={primaryLabel}
        onPrimaryClick={onPrimaryClick}
        onClose={onClose}
        primaryDisabled={primaryDisabled}
      />
    </>
  );
}
