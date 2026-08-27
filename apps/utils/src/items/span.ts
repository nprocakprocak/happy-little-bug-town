import { ITEM_SPAN } from "../constants/game.js";
import { ItemType } from "../types/itemType.js";

export function getItemSpan(itemType: ItemType): number {
  if (
    itemType === "leaf_rake" ||
    itemType === "shovel" ||
    itemType === "wheelbarrel" ||
    itemType === "basket"
  ) {
    return 2;
  }
  return ITEM_SPAN;
}
