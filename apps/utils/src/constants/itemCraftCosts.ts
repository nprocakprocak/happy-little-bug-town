import { ItemType, WorkshopItemType } from "../types/itemType.js";

export interface ItemCraftResourceCost {
  itemType: ItemType;
  count: number;
}

export const ITEM_CRAFT_COSTS: Record<
  WorkshopItemType,
  ItemCraftResourceCost[]
> = {
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
  knife: [
    { itemType: "brick", count: 1 },
    { itemType: "wood", count: 1 },
  ],
  crucible: [
    { itemType: "wood", count: 1 },
    { itemType: "brick", count: 1 },
    { itemType: "iron_ore", count: 1 },
  ],
  plow: [
    { itemType: "iron_ingot", count: 3 },
    { itemType: "wood", count: 1 },
  ],
  leaf_rake: [
    { itemType: "leaf_part", count: 5 },
    { itemType: "brick", count: 1 },
    { itemType: "wood", count: 1 },
    { itemType: "root", count: 2 },
  ],
  wheelbarrel: [
    { itemType: "wood", count: 2 },
    { itemType: "iron_ingot", count: 2 },
  ],
  basket: [
    { itemType: "iron_ingot", count: 2 },
    { itemType: "steel", count: 1 },
  ],
  shovel: [
    { itemType: "little_rock", count: 2 },
    { itemType: "stick", count: 1 },
    { itemType: "root", count: 3 },
  ],
};

export const WORKSHOP_ITEM_TYPES = Object.keys(
  ITEM_CRAFT_COSTS,
) as WorkshopItemType[];

export function getItemCraftCosts(itemType: ItemType): ItemCraftResourceCost[] {
  if (!isCraftableItemType(itemType)) {
    return [];
  }

  return ITEM_CRAFT_COSTS[itemType];
}

export function isCraftableItemType(
  itemType: ItemType,
): itemType is WorkshopItemType {
  return WORKSHOP_ITEM_TYPES.includes(itemType as WorkshopItemType);
}
