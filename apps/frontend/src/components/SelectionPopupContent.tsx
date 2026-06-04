"use client";

import { ReactNode } from "react";
import { ItemType } from "@happy-little-park/utils";

import { PopupActionFooter } from "./PopupActionFooter";
import { PopupResourceCosts } from "./PopupResourceCosts";

interface SelectionPopupContentProps {
  slider: ReactNode;
  resourceCosts: { itemType: ItemType; count: number }[];
  primaryLabel: string;
  onPrimaryClick: () => void;
  onClose: () => void;
  primaryDisabled?: boolean;
}

export function SelectionPopupContent({
  slider,
  resourceCosts,
  primaryLabel,
  onPrimaryClick,
  onClose,
  primaryDisabled,
}: SelectionPopupContentProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-[3cqi] px-[4cqi] pt-[4cqi] pb-[2cqi]">
        {slider}
        <PopupResourceCosts costs={resourceCosts} />
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
