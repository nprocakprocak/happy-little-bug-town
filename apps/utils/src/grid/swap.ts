import { isItemIncomplete, ItemForCraft } from "../items/craft.js";
import { Positionable } from "../types/positionable.js";
import { getSpannableSpan } from "./overlaps.js";

function isSwappableKind(entity: Positionable): boolean {
  if ("structureType" in entity && entity.structureType !== undefined) {
    return false;
  }

  if ("itemsCount" in entity && entity.itemsCount !== undefined) {
    return false;
  }

  return getSpannableSpan(entity) === 1;
}

function isCraftItem(
  entity: Positionable,
): entity is Positionable & ItemForCraft {
  return (
    "itemType" in entity &&
    entity.itemType !== undefined &&
    "items" in entity &&
    Array.isArray(entity.items)
  );
}

export function canSwapOnGrid(
  source: Positionable,
  target: Positionable,
): boolean {
  if (!isSwappableKind(source) || !isSwappableKind(target)) {
    return false;
  }

  if (isCraftItem(source) && isItemIncomplete(source)) {
    return false;
  }

  if (isCraftItem(target) && isItemIncomplete(target)) {
    return false;
  }

  return true;
}
