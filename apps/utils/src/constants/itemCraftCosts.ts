import { ItemType } from "../types/itemType.js";

export interface ItemCraftResourceCost {
  itemType: ItemType;
  count: number;
}

export const ITEM_CRAFT_COSTS: Partial<
  Record<ItemType, ItemCraftResourceCost[]>
> = {
  brick: [{ itemType: "little_rock", count: 3 }],
  wood: [{ itemType: "stick", count: 3 }],
  axe: [
    { itemType: "little_rock", count: 1 },
    { itemType: "stick", count: 1 },
    { itemType: "root", count: 3 },
  ],
  hammer_and_chisel: [
    { itemType: "little_rock", count: 3 },
    { itemType: "stick", count: 2 },
    { itemType: "root", count: 4 },
  ],
};

export function getItemCraftCosts(itemType: ItemType): ItemCraftResourceCost[] {
  return ITEM_CRAFT_COSTS[itemType] ?? [];
}

export function isCraftableItemType(itemType: ItemType): boolean {
  return getItemCraftCosts(itemType).length > 0;
}
