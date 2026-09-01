import { Positionable, structureFootprintFits } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";

export function isDropFootprintBlocked(
  origin: Positionable,
  cols: number,
  rows: number,
  remainingEntities: GridEntity[],
): boolean {
  return !structureFootprintFits(origin, cols, rows, remainingEntities);
}
