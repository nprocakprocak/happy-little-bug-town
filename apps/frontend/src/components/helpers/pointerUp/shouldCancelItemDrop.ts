import {
  canDiscardItemOnStructure,
  canDropFoodOnBug,
  canDropItemOnItem,
  canDropItemOnStructure,
  canStackItemType,
  canSwapOnGrid,
  isFoodForBug,
  Position,
} from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";
import { Item } from "../../../types/item";
import { isBug, isItem, isStack, isStructure } from "../typeGuards";
import { isDropFootprintBlocked } from "./isDropFootprintBlocked";

export function shouldCancelItemDrop(
  item: Item,
  overlapping: GridEntity | undefined,
  target: Position,
  items: Item[],
  cols: number,
  rows: number,
  remaining: GridEntity[],
): "cancel" | "stackCreateBlocked" | null {
  if (!overlapping) {
    return isDropFootprintBlocked(
      { x: target.x, y: target.y, itemType: item.itemType },
      cols,
      rows,
      remaining,
    )
      ? "cancel"
      : null;
  }

  if (isItem(overlapping)) {
    return itemOnItemCancelReason(item, overlapping, target, items, cols, rows, remaining);
  }

  if (isStack(overlapping)) {
    if (canJoinStack(item, overlapping.itemType, items)) {
      return null;
    }
    return cancelUnlessSwap(item, overlapping);
  }

  if (isBug(overlapping)) {
    if (isFoodForBug(item.itemType, overlapping)) {
      return canDropFoodOnBug(item.itemType, overlapping) ? null : "cancel";
    }
    return cancelUnlessSwap(item, overlapping);
  }

  if (isStructure(overlapping)) {
    if (canDropItemOnStructure(item, overlapping) || canDiscardItemOnStructure(overlapping)) {
      return null;
    }
    return cancelUnlessSwap(item, overlapping);
  }

  return cancelUnlessSwap(item, overlapping);
}

function itemOnItemCancelReason(
  item: Item,
  overlapping: Item,
  target: Position,
  items: Item[],
  cols: number,
  rows: number,
  remaining: GridEntity[],
): "cancel" | "stackCreateBlocked" | null {
  if (canDropItemOnItem(item, overlapping)) {
    return null;
  }

  if (!canJoinStack(item, overlapping.itemType, items)) {
    return cancelUnlessSwap(item, overlapping);
  }

  const remainingWithoutTarget = remaining.filter((entity) => entity.id !== overlapping.id);
  return isDropFootprintBlocked(
    { x: target.x, y: target.y, itemsCount: 2 },
    cols,
    rows,
    remainingWithoutTarget,
  )
    ? "stackCreateBlocked"
    : null;
}

function canJoinStack(item: Item, otherItemType: Item["itemType"], items: Item[]): boolean {
  return otherItemType === item.itemType && canStackItemType(item.itemType, items);
}

function cancelUnlessSwap(item: Item, overlapping: GridEntity): "cancel" | null {
  return canSwapOnGrid(item, overlapping) ? null : "cancel";
}
