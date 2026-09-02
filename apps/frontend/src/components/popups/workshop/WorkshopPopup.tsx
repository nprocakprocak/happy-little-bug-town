"use client";

import { ItemType } from "@happy-little-bug-town/utils";

import { Item } from "../../../types/item";
import { GridPopup } from "../shared/GridPopup";
import { WorkshopItemsPopupContent } from "./WorkshopItemsPopupContent";

interface WorkshopPopupProps {
  onClose: () => void;
  onCreateItem: (itemType: ItemType) => void;
  items: Item[];
  workshopUpgradeLevel: number;
  isCreating?: boolean;
}

export function WorkshopPopup({
  onClose,
  onCreateItem,
  items,
  workshopUpgradeLevel,
  isCreating,
}: WorkshopPopupProps) {
  return (
    <GridPopup onClose={onClose}>
      <WorkshopItemsPopupContent
        onClose={onClose}
        onCreateItem={onCreateItem}
        items={items}
        workshopUpgradeLevel={workshopUpgradeLevel}
        isCreating={isCreating}
      />
    </GridPopup>
  );
}
