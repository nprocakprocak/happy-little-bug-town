import { isCraftableItemType } from "../constants/itemCraftCosts.js";
import { ItemType, WorkshopItemType } from "../types/itemType.js";

const UNIQUE_CRAFTABLE_ITEM_TYPES = new Set<WorkshopItemType>([
  "leaf_rake",
  "shovel",
  "wheelbarrel",
  "basket",
  "hammer",
]);

const WORKSHOP_ITEM_REQUIRED_UPGRADE_LEVEL: Partial<Record<WorkshopItemType, number>> = {
  hoe: 1,
  wheelbarrel: 1,
  desk: 1,
  fountain: 2,
  basket: 2,
};

export function canCreateMultipleOfItemType(itemType: ItemType): boolean {
  if (!isCraftableItemType(itemType)) {
    return false;
  }

  return !UNIQUE_CRAFTABLE_ITEM_TYPES.has(itemType);
}

export function hasItemType<T extends { itemType: ItemType }>(
  items: T[],
  itemType: ItemType,
): boolean {
  return items.some((item) => item.itemType === itemType);
}

function getRequiredWorkshopUpgradeLevel(itemType: WorkshopItemType): number {
  return WORKSHOP_ITEM_REQUIRED_UPGRADE_LEVEL[itemType] ?? 0;
}

export function isWorkshopItemUnlocked(
  itemType: ItemType,
  workshopUpgradeLevel: number,
): boolean {
  if (!isCraftableItemType(itemType)) {
    return false;
  }

  return workshopUpgradeLevel >= getRequiredWorkshopUpgradeLevel(itemType);
}

export function canCreateItemType(
  items: { itemType: ItemType }[],
  itemType: ItemType,
): boolean {
  if (!isCraftableItemType(itemType)) {
    return false;
  }

  if (canCreateMultipleOfItemType(itemType)) {
    return true;
  }

  return !hasItemType(items, itemType);
}
