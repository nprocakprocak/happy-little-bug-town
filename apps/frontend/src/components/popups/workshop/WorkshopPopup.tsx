"use client";

import { ItemType } from "@happy-little-bug-town/utils";

import { Item } from "../../../types/item";
import { GridPopup } from "../shared/GridPopup";
import { WorkshopItemsPopupContent } from "./WorkshopItemsPopupContent";

interface WorkshopPopupProps {
  onClose: () => void;
  onCreateItem: (itemType: ItemType) => void;
  items: Item[];
  isCreating?: boolean;
}

export function WorkshopPopup({ onClose, onCreateItem, items, isCreating }: WorkshopPopupProps) {
  return (
    <GridPopup>
      <WorkshopItemsPopupContent
        onClose={onClose}
        onCreateItem={onCreateItem}
        items={items}
        isCreating={isCreating}
      />
    </GridPopup>
  );
}
