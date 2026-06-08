"use client";

import { ReactNode } from "react";
import { ItemType, ToolType } from "@happy-little-park/utils";

import { PopupActionFooter } from "./PopupActionFooter";
import { PopupResourceCosts } from "./PopupResourceCosts";

interface SelectionPopupContentProps {
  slider: ReactNode;
  itemCosts: { itemType: ItemType; count: number }[];
  toolCosts?: { toolType: ToolType; count: number }[];
  primaryLabel: string;
  onPrimaryClick: () => void;
  onClose: () => void;
  primaryDisabled?: boolean;
}

export function SelectionPopupContent({
  slider,
  itemCosts,
  toolCosts,
  primaryLabel,
  onPrimaryClick,
  onClose,
  primaryDisabled,
}: SelectionPopupContentProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-[3cqi] px-[4cqi] pt-[4cqi] pb-[2cqi]">
        {slider}
        <PopupResourceCosts itemCosts={itemCosts} toolCosts={toolCosts} />
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
