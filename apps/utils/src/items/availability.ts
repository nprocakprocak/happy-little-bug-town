import { isCraftableItemType } from "../constants/itemCraftCosts.js";
import { ItemType } from "../types/itemType.js";

const UNIQUE_CRAFTABLE_ITEM_TYPES = new Set<ItemType>([
  "leaf_rake",
  "shovel",
  "wheelbarrel",
]);

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
