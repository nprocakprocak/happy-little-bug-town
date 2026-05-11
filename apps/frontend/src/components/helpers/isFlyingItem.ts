import { Item } from "@happy-little-park/types";

export function isFlyingItem(item: Item): item is Item & { fromX: number; fromY: number } {
  return item.fromX !== undefined && item.fromY !== undefined;
}
