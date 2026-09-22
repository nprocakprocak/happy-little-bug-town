import { ItemForCraft } from "../items/craft.js";
import { hasCraftedItem } from "../items/stacking.js";
import { isInfiniteSource } from "../stacks/source.js";
import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";
import { isGroundEvolutionStructureType } from "./evolution.js";
import { getHouseOccupants, getHouseSourceBugType } from "./greenflyHouse.js";

interface DemolishableStructure {
  structureType: StructureType;
  bugs: { id: string; bugType: BugType }[];
}

export function isSelfGeneratingHouse(structure: DemolishableStructure): boolean {
  if (!getHouseSourceBugType(structure.structureType)) {
    return false;
  }

  return isInfiniteSource(getHouseOccupants(structure).length);
}

export function canDemolishStructureType(
  structureType: StructureType,
  items: ItemForCraft[],
): boolean {
  if (isGroundEvolutionStructureType(structureType)) {
    return false;
  }

  return hasCraftedItem(items, "hammer");
}

export function canDemolishStructure(
  structure: DemolishableStructure,
  items: ItemForCraft[],
): boolean {
  if (isSelfGeneratingHouse(structure)) {
    return false;
  }

  return canDemolishStructureType(structure.structureType, items);
}
