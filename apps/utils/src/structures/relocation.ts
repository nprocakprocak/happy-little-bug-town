import { ItemForCraft } from "../items/craft.js";
import { hasCraftedItem } from "../items/stacking.js";
import { isStructureIncomplete, StructureForBuild } from "./build.js";
import { isGroundEvolutionStructureType } from "./evolution.js";

export function canRelocateStructure(
  structure: StructureForBuild,
  items: ItemForCraft[],
): boolean {
  if (isGroundEvolutionStructureType(structure.structureType)) {
    return false;
  }

  return isStructureIncomplete(structure) || hasCraftedItem(items, "hammer");
}
