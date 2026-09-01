import { canRelocateStructureType, Position } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";
import { Item } from "../../../types/item";
import { Structure } from "../../../types/structure";
import { isDropFootprintBlocked } from "./isDropFootprintBlocked";

export function shouldCancelStructureDrop(
  structure: Structure,
  target: Position,
  items: Item[],
  cols: number,
  rows: number,
  remaining: GridEntity[],
): "cancel" | null {
  if (!canRelocateStructureType(structure.structureType, items)) {
    return "cancel";
  }

  return isDropFootprintBlocked(
    { x: target.x, y: target.y, structureType: structure.structureType },
    cols,
    rows,
    remaining,
  )
    ? "cancel"
    : null;
}
