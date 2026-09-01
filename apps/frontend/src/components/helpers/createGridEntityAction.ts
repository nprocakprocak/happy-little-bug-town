import {
  canCreateItemType,
  findFirstStructurePlacement,
  isBuildableStructureType,
  isWorkshopItemUnlocked,
  ItemType,
  Position,
  Positionable,
  Spannable,
} from "@happy-little-bug-town/utils";

import { Item } from "../../types/item";
import { Structure } from "../../types/structure";

function withFirstPlacement<T extends Spannable>(
  spec: T,
  cols: number,
  rows: number,
  entities: Positionable[],
): (T & Position) | null {
  const position = findFirstStructurePlacement(spec, cols, rows, entities);
  if (!position) {
    return null;
  }
  return { ...spec, ...position };
}

export function beetleBuildAction(
  structure: Structure,
  cols: number,
  rows: number,
  entities: Positionable[],
) {
  if (!isBuildableStructureType(structure.structureType)) {
    return null;
  }

  return withFirstPlacement({ structureType: structure.structureType }, cols, rows, entities);
}

export function workshopCreateItemAction(
  itemType: ItemType,
  workshopUpgradeLevel: number,
  items: Item[],
  cols: number,
  rows: number,
  entities: Positionable[],
) {
  if (
    !isWorkshopItemUnlocked(itemType, workshopUpgradeLevel) ||
    !canCreateItemType(items, itemType)
  ) {
    return null;
  }

  return withFirstPlacement({ itemType }, cols, rows, entities);
}
