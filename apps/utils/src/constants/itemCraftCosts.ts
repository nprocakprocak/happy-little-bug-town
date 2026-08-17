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
  nettle_soup: [{ itemType: "leaf_part", count: 2 }],
  grilled_roots: [{ itemType: "root", count: 2 }],
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
  leaf_rake: [
    { itemType: "leaf_part", count: 5 },
    { itemType: "brick", count: 1 },
    { itemType: "wood", count: 1 },
    { itemType: "root", count: 2 },
  ],
  shovel: [
    { itemType: "little_rock", count: 2 },
    { itemType: "stick", count: 1 },
    { itemType: "root", count: 3 },
  ],
  knife: [
    { itemType: "brick", count: 1 },
    { itemType: "wood", count: 1 },
  ],
  crucible: [
    { itemType: "wood", count: 1 },
    { itemType: "brick", count: 1 },
    { itemType: "iron_ore", count: 1 },
  ],
};

export function getItemCraftCosts(itemType: ItemType): ItemCraftResourceCost[] {
  return ITEM_CRAFT_COSTS[itemType] ?? [];
}

export function isCraftableItemType(itemType: ItemType): boolean {
  return getItemCraftCosts(itemType).length > 0;
}
