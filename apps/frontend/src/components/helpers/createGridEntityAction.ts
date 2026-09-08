import {
  BuildableStructureType,
  canCreateItemType,
  findFirstStructurePlacement,
  isBuildableStructureType,
  isWorkshopItemUnlocked,
  ItemType,
  Position,
  Positionable,
  Spannable
} from "@happy-little-bug-town/utils";

import { CannotBuildReason } from "../../types/dialogue";
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

type BeetleBuildActionResult =
  | { kind: "ok"; payload: { structureType: BuildableStructureType } & Position }
  | { kind: "error"; reason: CannotBuildReason };

export function beetleBuildAction(
  structure: Structure,
  cols: number,
  rows: number,
  entities: Positionable[],
): BeetleBuildActionResult | null {
  if (!isBuildableStructureType(structure.structureType)) {
    return null;
  }


  const payload = withFirstPlacement(
    { structureType: structure.structureType },
    cols,
    rows,
    entities,
  );
  
  if (!payload) {
    return { kind: "error", reason: "noSpace" };
  }

  return { kind: "ok", payload };
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
