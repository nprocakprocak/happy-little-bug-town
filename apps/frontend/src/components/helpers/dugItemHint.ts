import { ItemType } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../types/gridEntity";
import { isBug, isItem, isStack, isStructure } from "./typeGuards";
import { dugFirstItemDialogue } from "../../utils/dialogue";

export function hasDugItemHintItem(entities: GridEntity[]): boolean {
  return entities.some(entityHasDugItemHint);
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
