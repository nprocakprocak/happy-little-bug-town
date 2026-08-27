import { ItemType } from "../types/itemType.js";
import { isItemCrafted, ItemForCraft } from "./craft.js";

const LEAF_RAKE_ITEM_TYPE: ItemType = "leaf_rake";
const WHEELBARREL_ITEM_TYPE: ItemType = "wheelbarrel";
const BASKET_ITEM_TYPE: ItemType = "basket";

const LEAF_RAKE_STACKABLE_ITEM_TYPES: Set<ItemType> = new Set([
  "leaf_part",
  "stick",
  "root",
]);

const WHEELBARREL_STACKABLE_ITEM_TYPES: Set<ItemType> = new Set([
  "little_rock",
  "iron_ore",
  "clay",
  "glass",
  "gravel",
]);

const BASKET_STACKABLE_ITEM_TYPES: Set<ItemType> = new Set([
  "rotten_apple",
  "paper",
  "seeds",
]);

export function hasCraftedItem(
  items: ItemForCraft[],
  itemType: ItemType,
): boolean {
  return items.some(
    (item) => item.itemType === itemType && isItemCrafted(item),
  );
}

export function canStackItemType(
  itemType: ItemType,
  items: ItemForCraft[],
): boolean {
  if (LEAF_RAKE_STACKABLE_ITEM_TYPES.has(itemType)) {
    return hasCraftedItem(items, LEAF_RAKE_ITEM_TYPE);
  }

  if (WHEELBARREL_STACKABLE_ITEM_TYPES.has(itemType)) {
    return hasCraftedItem(items, WHEELBARREL_ITEM_TYPE);
  }

  if (BASKET_STACKABLE_ITEM_TYPES.has(itemType)) {
    return hasCraftedItem(items, BASKET_ITEM_TYPE);
  }

  return false;
}
