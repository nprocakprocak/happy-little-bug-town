"use client";

import { useMemo, useState } from "react";
import {
  canCreateItemType,
  canCreateMultipleOfItemType,
  getItemCraftCosts,
  hasItemType,
  isWorkshopItemUnlocked,
  ItemType,
  WORKSHOP_ITEM_TYPES,
  WorkshopItemType,
} from "@happy-little-bug-town/utils";

import { Item } from "../../../types/item";
import { itemTypeToDescription } from "../../helpers/itemDescription";
import { itemTypeToImageForItem } from "../../helpers/itemImages";
import { itemTypeToName } from "../../helpers/itemName";
import { CarouselSlider } from "../../ui/CarouselSlider";
import { SelectionPopupContent } from "../shared/SelectionPopupContent";

interface WorkshopItemOption {
  id: string;
  itemType: WorkshopItemType;
}

const WORKSHOP_ITEM_OPTIONS: WorkshopItemOption[] = WORKSHOP_ITEM_TYPES.map((itemType) => ({
  id: `workshop-item-option-${itemType}`,
  itemType,
}));

interface WorkshopItemsPopupContentProps {
  onClose: () => void;
  onCreateItem: (itemType: ItemType) => void;
  items: Item[];
  workshopUpgradeLevel: number;
  isCreating?: boolean;
}

function getPrimaryLabel(isAlreadyCrafted: boolean, isUnlocked: boolean): string {
  if (isAlreadyCrafted) {
    return "Already crafted";
  }
  if (!isUnlocked) {
    return "Requires upgrade";
  }
  return "Create";
}

export function WorkshopItemsPopupContent({
  onClose,
  onCreateItem,
  items,
  workshopUpgradeLevel,
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
  const isUnlocked = isWorkshopItemUnlocked(selectedItem.itemType, workshopUpgradeLevel);
  const canCreate = isUnlocked && canCreateItemType(items, selectedItem.itemType);
  const isAlreadyCrafted =
    !canCreateMultipleOfItemType(selectedItem.itemType) &&
    hasItemType(items, selectedItem.itemType);

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
      description={itemTypeToDescription(selectedItem.itemType)}
      primaryLabel={getPrimaryLabel(isAlreadyCrafted, isUnlocked)}
      onPrimaryClick={handleCreateClick}
      onClose={onClose}
      primaryDisabled={isCreating || !canCreate}
    />
  );
}
