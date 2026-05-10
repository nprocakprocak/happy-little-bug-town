import { Item } from "../../types/item";

export function isFlyingItem(item: Item): item is Item & { fromX: number; fromY: number } {
  return item.fromX !== undefined && item.fromY !== undefined;
}
