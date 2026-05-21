import { Item } from "../types/item";
import { Stack } from "../types/stack";

export function isStack(item: Item | Stack): item is Stack {
  return "itemsCount" in item;
}

export function isItem(item: Item | Stack): item is Item {
  return !isStack(item);
}
