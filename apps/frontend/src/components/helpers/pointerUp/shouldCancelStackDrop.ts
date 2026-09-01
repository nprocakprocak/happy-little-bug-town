import { canStackItemType, Position } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";
import { Item } from "../../../types/item";
import { Stack } from "../../../types/stack";
import { isStack } from "../typeGuards";
import { isDropFootprintBlocked } from "./isDropFootprintBlocked";

export function shouldCancelStackDrop(
  stack: Stack,
  overlapping: GridEntity | undefined,
  target: Position,
  items: Item[],
  cols: number,
  rows: number,
  remaining: GridEntity[],
): "cancel" | null {
  if (!overlapping) {
    return isDropFootprintBlocked(
      { x: target.x, y: target.y, itemsCount: stack.itemsCount },
      cols,
      rows,
      remaining,
    )
      ? "cancel"
      : null;
  }

  const canMerge =
    isStack(overlapping) &&
    overlapping.itemType === stack.itemType &&
    canStackItemType(stack.itemType, items);

  return canMerge ? null : "cancel";
}
