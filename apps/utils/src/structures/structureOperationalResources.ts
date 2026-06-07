import {
  STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS,
  StructureOperationalResourceRequirement,
} from "../constants/structureOperationalResources.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import {
  getBuildResourceCosts,
  isStructureBuilt,
  StructureForBuild,
} from "./build.js";
import { isStructurePowered, StructureForPower } from "./power.js";

function getStructureItemCount(structure: StructureForBuild, itemType: ItemType): number {
  return structure.items.filter((item) => item.itemType === itemType).length;
}

function getBuildResourceCount(structureType: StructureType, itemType: ItemType): number {
  const buildCosts = getBuildResourceCosts(structureType);
  return buildCosts?.find((cost) => cost.itemType === itemType)?.count ?? 0;
}

export function getStructureOperationalResourceRequirement(
  structureType: StructureType,
): StructureOperationalResourceRequirement | undefined {
  return STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS[structureType];
}

export function getStructureOperationalResourceCount(structure: StructureForBuild): number {
  const requirement = getStructureOperationalResourceRequirement(structure.structureType);
  if (!requirement || !isStructureBuilt(structure)) {
    return 0;
  }

  const suppliedItems = getStructureItemCount(structure, requirement.itemType);
  const buildItems = getBuildResourceCount(structure.structureType, requirement.itemType);
  return Math.max(0, suppliedItems - buildItems);
}

export function getStructureOperationalResourceLimit(structure: StructureForBuild): number {
  return getStructureOperationalResourceRequirement(structure.structureType)?.maxCount ?? 0;
}

export function canAcceptOperationalResourceForStructure(
  structure: StructureForBuild & StructureForPower,
  itemType: ItemType,
): boolean {
  const requirement = getStructureOperationalResourceRequirement(structure.structureType);
  if (!requirement || requirement.itemType !== itemType) {
    return false;
  }

  return (
    isStructureBuilt(structure) &&
    isStructurePowered(structure) &&
    getStructureOperationalResourceCount(structure) < requirement.maxCount
  );
}
