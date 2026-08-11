import {
  STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS,
  StructureOperationalResourceOutputs,
  StructureOperationalResourceRequirement,
} from "../constants/structureOperationalResources.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import {
  getBuildResourceCosts,
  isStructureBuilt,
  StructureForBuild,
  StructureWithIdentifiableItems,
} from "./build.js";
import { isStructurePowered, StructureForPower } from "./power.js";

export interface CraftableOperationalResourceOutput {
  outputItemType: ItemType;
  requirement: StructureOperationalResourceRequirement;
}

export interface StructureOperationalResourceProgress {
  outputItemType: ItemType;
  requirement: StructureOperationalResourceRequirement;
  count: number;
}

function getAllOperationalRequirements(
  outputs: StructureOperationalResourceOutputs,
): StructureOperationalResourceRequirement[] {
  return Object.values(outputs);
}

function getOperationalOutputEntries(
  outputs: StructureOperationalResourceOutputs,
): [ItemType, StructureOperationalResourceRequirement][] {
  return Object.entries(outputs) as [
    ItemType,
    StructureOperationalResourceRequirement,
  ][];
}

function getStructureItemCount(
  structure: StructureForBuild,
  itemType: ItemType,
): number {
  return structure.items.filter((item) => item.itemType === itemType).length;
}

function getBuildResourceCount(
  structureType: StructureType,
  itemType: ItemType,
): number {
  const buildCosts = getBuildResourceCosts(structureType);
  return buildCosts?.find((cost) => cost.itemType === itemType)?.count ?? 0;
}

function getOperationalResourceCountForRequirement(
  structure: StructureForBuild,
  requirement: StructureOperationalResourceRequirement,
): number {
  if (!isStructureBuilt(structure)) {
    return 0;
  }

  const suppliedItems = getStructureItemCount(structure, requirement.itemType);
  const buildItems = getBuildResourceCount(
    structure.structureType,
    requirement.itemType,
  );
  return Math.max(0, suppliedItems - buildItems);
}

export function getStructureOperationalResourceOutputs(
  structureType: StructureType,
): StructureOperationalResourceOutputs | undefined {
  return STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS[structureType];
}

export function getStructureOperationalResourceProgresses(
  structure: StructureForBuild,
): StructureOperationalResourceProgress[] {
  const outputs = getStructureOperationalResourceOutputs(
    structure.structureType,
  );
  if (!outputs) {
    return [];
  }

  return getOperationalOutputEntries(outputs).map(
    ([outputItemType, requirement]) => ({
      outputItemType,
      requirement,
      count: getOperationalResourceCountForRequirement(structure, requirement),
    }),
  );
}

export function getVisibleStructureOperationalResourceProgresses(
  structure: StructureForBuild,
): StructureOperationalResourceProgress[] {
  return getStructureOperationalResourceProgresses(structure).filter(
    (progress) => progress.count > 0,
  );
}

export function hasStructureOperationalResources(
  structure: StructureForBuild,
): boolean {
  return getVisibleStructureOperationalResourceProgresses(structure).length > 0;
}

export function canAcceptOperationalResourceForStructure(
  structure: StructureForBuild & StructureForPower,
  itemType: ItemType,
): boolean {
  const outputs = getStructureOperationalResourceOutputs(
    structure.structureType,
  );
  if (
    !outputs ||
    !isStructureBuilt(structure) ||
    !isStructurePowered(structure)
  ) {
    return false;
  }

  return getAllOperationalRequirements(outputs).some(
    (requirement) =>
      requirement.itemType === itemType &&
      getOperationalResourceCountForRequirement(structure, requirement) <
        requirement.maxCount,
  );
}

export function getStructureOperationalResourceItems(
  structure: StructureWithIdentifiableItems,
  requirement: StructureOperationalResourceRequirement,
): { id: string; itemType: ItemType }[] {
  if (!isStructureBuilt(structure)) {
    return [];
  }

  const matchingItems = structure.items.filter(
    (item) => item.itemType === requirement.itemType,
  );
  const buildItems = getBuildResourceCount(
    structure.structureType,
    requirement.itemType,
  );
  return matchingItems.slice(buildItems);
}

export function getCraftableOperationalResourceOutput(
  structure: StructureForBuild & StructureForPower,
): CraftableOperationalResourceOutput | undefined {
  if (!isStructureBuilt(structure) || !isStructurePowered(structure)) {
    return undefined;
  }

  return getStructureOperationalResourceProgresses(structure).find(
    (progress) => progress.count >= progress.requirement.maxCount,
  );
}

export function getCraftableOperationalResourceOutputs(
  structure: StructureForBuild & StructureForPower,
): CraftableOperationalResourceOutput[] {
  if (!isStructureBuilt(structure) || !isStructurePowered(structure)) {
    return [];
  }

  return getStructureOperationalResourceProgresses(structure).filter(
    (progress) => progress.count >= progress.requirement.maxCount,
  );
}

export function canCraftFromStructureOperationalResources(
  structure: StructureForBuild & StructureForPower,
): boolean {
  return getCraftableOperationalResourceOutput(structure) !== undefined;
}
