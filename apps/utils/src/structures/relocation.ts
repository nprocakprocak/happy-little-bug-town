import { ItemForCraft } from "../items/craft.js";
import { hasCraftedItem } from "../items/stacking.js";
import { StructureType } from "../types/structureType.js";
import { isGroundEvolutionStructureType } from "./evolution.js";

export function canRelocateStructureType(
  structureType: StructureType,
  items: ItemForCraft[],
): boolean {
  if (isGroundEvolutionStructureType(structureType)) {
    return false;
  }

  return hasCraftedItem(items, "hammer");
}
