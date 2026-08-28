import {
  canDropItemOnItem,
  canStackItemType,
  canSwapOnGrid,
  isFoodForBug,
  Positionable,
} from "@happy-little-bug-town/utils";

import { Item } from "../types/item";
import { isBug, isItem } from "./typeGuards";

export function isSwapDrop(
  entity: Positionable,
  targetEntity: Positionable,
  items: Item[],
): boolean {
  if (!canSwapOnGrid(entity, targetEntity)) {
    return false;
  }

  if (isItem(entity) && isItem(targetEntity) && canDropItemOnItem(entity, targetEntity)) {
    return false;
  }

  if (
    isItem(entity) &&
    isItem(targetEntity) &&
    entity.itemType === targetEntity.itemType &&
    canStackItemType(entity.itemType, items)
  ) {
    return false;
  }

  if (isItem(entity) && isBug(targetEntity) && isFoodForBug(entity.itemType, targetEntity)) {
    return false;
  }

  return true;
}
