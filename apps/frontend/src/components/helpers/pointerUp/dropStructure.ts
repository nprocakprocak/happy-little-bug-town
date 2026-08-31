import {
  canRelocateStructureType,
  Position,
  structureFootprintFits,
} from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";
import { Item } from "../../../types/item";
import { Structure } from "../../../types/structure";

export function dropStructure(
  structureToDrop: Structure,
  dropPosition: Position,
  items: Item[],
  cols: number,
  rows: number,
  remainingEntities: GridEntity[],
): {
  shouldCancel: boolean;
} {
  const fits = structureFootprintFits(
    {
      x: dropPosition.x,
      y: dropPosition.y,
      structureType: structureToDrop.structureType,
    },
    cols,
    rows,
    remainingEntities,
  );

  return {
    shouldCancel: !(fits && canRelocateStructureType(structureToDrop.structureType, items)),
  };
}
