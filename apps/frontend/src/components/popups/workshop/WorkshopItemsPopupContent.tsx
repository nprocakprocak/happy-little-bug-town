"use client";

import { useMemo, useState } from "react";
import { canCreateItemType, getItemCraftCosts, ItemType } from "@happy-little-bug-town/utils";

import { WORKSHOP_ITEM_OPTIONS } from "../../../constants/workshopItems";
import { Item } from "../../../types/item";
import { itemTypeToName } from "../../helpers/getItemName";
import { itemTypeToImageForItem } from "../../helpers/itemTypeToImage";
import { CarouselSlider } from "../../ui/CarouselSlider";
import { SelectionPopupContent } from "../shared/SelectionPopupContent";

interface WorkshopItemsPopupContentProps {
  onClose: () => void;
  onCreateItem: (itemType: ItemType) => void;
  items: Item[];
  isCreating?: boolean;
}

export function WorkshopItemsPopupContent({
  onClose,
  onCreateItem,
  items,
  isCreating,
}: WorkshopItemsPopupContentProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const carouselOptions = useMemo(
    () =>
      WORKSHOP_ITEM_OPTIONS.map((item) => ({
        id: item.id,
        imageSrc: itemTypeToImageForItem(item.itemType),
        label: itemTypeToName(item.itemType),
      })),
    [],
  );
  const selectedItem = WORKSHOP_ITEM_OPTIONS[selectedItemIndex];
  const selectedResourceCosts = getItemCraftCosts(selectedItem.itemType);
  const canCreate = canCreateItemType(items, selectedItem.itemType);

  function handleCreateClick() {
    if (!canCreate) {
      return;
    }
    onCreateItem(selectedItem.itemType);
  }

  return (
    <SelectionPopupContent
      slider={
        <CarouselSlider
          options={carouselOptions}
          selectedIndex={selectedItemIndex}
          onSelectedIndexChange={setSelectedItemIndex}
          previousAriaLabel="Previous item"
          nextAriaLabel="Next item"
          selectAriaLabelPrefix="Select item"
        />
      }
      itemCosts={selectedResourceCosts}
      primaryLabel="Create"
      onPrimaryClick={handleCreateClick}
      onClose={onClose}
      primaryDisabled={isCreating || !canCreate}
    />
  );
}
