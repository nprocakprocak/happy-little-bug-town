import { ItemType } from "../types/itemType.js";
import { canAcceptItemForBuild, StructureForBuild } from "./build.js";
import { StructureForPower } from "./power.js";
import { canAcceptOperationalResourceForStructure } from "./structureOperationalResources.js";

export function canDropItemOnStructure(
  item: { itemType: ItemType },
  structure: StructureForBuild & StructureForPower,
): boolean {
  if (canAcceptItemForBuild(structure, item.itemType)) {
    return true;
  }

  return canAcceptOperationalResourceForStructure(structure, item.itemType);
}
