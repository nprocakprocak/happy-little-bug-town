import { ItemType } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../types/gridEntity";
import { dugFirstItemDialogue } from "../../utils/dialogue";
import { isBug, isItem, isStack, isStructure } from "./typeGuards";

export function hasDugItemHintItem(entities: GridEntity[]): boolean {
  return entities.some(entityHasDugItemHint);
}

export function hasDugBeetle(entities: GridEntity[]): boolean {
  return entities.some(entityHasBeetle);
}

function entityHasDugItemHint(entity: GridEntity): boolean {
  if (isItem(entity) || isStack(entity)) {
    return isDugItemHintType(entity.itemType);
  }
  if (isStructure(entity) || isBug(entity)) {
    return entity.items.some((ownedItem) => isDugItemHintType(ownedItem.itemType));
  }
  return false;
}

function isDugItemHintType(itemType: ItemType): boolean {
  return dugFirstItemDialogue(itemType) !== null;
}

function entityHasBeetle(entity: GridEntity): boolean {
  if (isBug(entity)) {
    return entity.bugType === "beetle";
  }
  if (isStructure(entity) || isStack(entity)) {
    return entity.bugs.some((bug) => bug.bugType === "beetle");
  }
  return false;
}
