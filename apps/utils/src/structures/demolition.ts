import { ItemForCraft } from "../items/craft.js";
import { hasCraftedItem } from "../items/stacking.js";
import { StructureType } from "../types/structureType.js";
import { isGroundEvolutionStructureType } from "./evolution.js";

function isDemolishExemptStructureType(structureType: StructureType): boolean {
  return structureType === "beetle_house" || structureType === "greenfly_house";
}

export function canDemolishStructureType(
  structureType: StructureType,
  items: ItemForCraft[],
): boolean {
  if (isGroundEvolutionStructureType(structureType)) {
    return false;
  }

  if (isDemolishExemptStructureType(structureType)) {
    return false;
  }

  return hasCraftedItem(items, "hammer");
}
