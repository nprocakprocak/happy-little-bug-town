import { ItemType } from "../types/itemType.js";

export interface ItemCraftResourceCost {
  itemType: ItemType;
  count: number;
}

export const ITEM_CRAFT_COSTS: Partial<Record<ItemType, ItemCraftResourceCost[]>> = {};

export function getItemCraftCosts(itemType: ItemType): ItemCraftResourceCost[] {
  return ITEM_CRAFT_COSTS[itemType] ?? [];
}

export function isCraftableItemType(itemType: ItemType): boolean {
  return getItemCraftCosts(itemType).length > 0;
}
