import { ITEM_SPAN } from "../constants/game.js";
import { ItemType } from "../types/itemType.js";

export function getItemSpan(itemType: ItemType): number {
  void itemType;
  return ITEM_SPAN;
}
