import {
  STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS,
  StructureOperationalOutputType,
  StructureOperationalResourceOutputs,
  StructureOperationalResourceRequirement,
} from "../constants/structureOperationalResources.js";
import { ItemType } from "../types/itemType.js";
import {
  isStructureBuilt,
  StructureForBuild,
  StructureWithIdentifiableItems,
} from "./build.js";
import { isStructurePowered, StructureForPower } from "./power.js";
import {
  getReservedItemCountForOperationalResources,
  isStructureUpgradeIncomplete,
  StructureForUpgrade,
} from "./upgrade.js";

export interface CraftableOperationalResourceOutput {
  outputType: StructureOperationalOutputType;
  requirement: StructureOperationalResourceRequirement;
}

export interface StructureOperationalResourceProgress {
  outputType: StructureOperationalOutputType;
  requirement: StructureOperationalResourceRequirement;
  count: number;
}

export type StructureForOperationalResources = StructureForBuild &
  StructureForUpgrade;

function getAllOperationalRequirements(
  outputs: StructureOperationalResourceOutputs,
): StructureOperationalResourceRequirement[] {
  return Object.values(outputs);
}

function getOperationalOutputEntries(
  outputs: StructureOperationalResourceOutputs,
): [StructureOperationalOutputType, StructureOperationalResourceRequirement][] {
  return Object.entries(outputs) as [
    StructureOperationalOutputType,
    StructureOperationalResourceRequirement,
  ][];
}

function getStructureItemCount(
  structure: StructureForBuild,
  itemType: ItemType,
): number {
  return structure.items.filter((item) => item.itemType === itemType).length;
}

function getOperationalUpgradeLevel(structure: StructureForUpgrade): number {
  if (isStructureUpgradeIncomplete(structure)) {
    return Math.max(0, structure.upgradeLevel - 1);
  }
  return structure.upgradeLevel;
}

function getOperationalResourceCountForRequirement(
  structure: StructureForOperationalResources,
  requirement: StructureOperationalResourceRequirement,
): number {
  if (!isStructureBuilt(structure)) {
    return 0;
  }

  const suppliedItems = getStructureItemCount(structure, requirement.itemType);
  const reservedItems = getReservedItemCountForOperationalResources(
    structure,
    requirement.itemType,
  );
  return Math.max(0, suppliedItems - reservedItems);
}

export function getStructureOperationalResourceOutputs(
  structure: StructureForUpgrade,
): StructureOperationalResourceOutputs | undefined {
  const outputsByLevel =
    STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS[structure.structureType];
  if (!outputsByLevel) {
    return undefined;
  }

  const operationalLevel = getOperationalUpgradeLevel(structure);
  const mergedOutputs: StructureOperationalResourceOutputs = {};
  let hasOutputs = false;

  for (let level = 0; level <= operationalLevel; level++) {
    const levelOutputs = outputsByLevel[level];
    if (!levelOutputs) {
      continue;
    }
    Object.assign(mergedOutputs, levelOutputs);
    hasOutputs = true;
  }

  if (!hasOutputs) {
    return undefined;
  }

  return mergedOutputs;
}

export function getStructureOperationalResourceProgresses(
  structure: StructureForOperationalResources,
): StructureOperationalResourceProgress[] {
  const outputs = getStructureOperationalResourceOutputs(structure);
  if (!outputs) {
    return [];
  }

  return getOperationalOutputEntries(outputs).map(
    ([outputType, requirement]) => ({
      outputType,
      requirement,
      count: getOperationalResourceCountForRequirement(structure, requirement),
    }),
  );
}

export function getVisibleStructureOperationalResourceProgresses(
  structure: StructureForOperationalResources,
): StructureOperationalResourceProgress[] {
  return getStructureOperationalResourceProgresses(structure).filter(
    (progress) => progress.count > 0,
  );
}

export function hasStructureOperationalResources(
  structure: StructureForOperationalResources,
): boolean {
  return getVisibleStructureOperationalResourceProgresses(structure).length > 0;
}

export function canAcceptOperationalResourceForStructure(
  structure: StructureForOperationalResources & StructureForPower,
  itemType: ItemType,
): boolean {
  const outputs = getStructureOperationalResourceOutputs(structure);
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
  structure: StructureWithIdentifiableItems & StructureForUpgrade,
  requirement: StructureOperationalResourceRequirement,
): { id: string; itemType: ItemType }[] {
  if (!isStructureBuilt(structure)) {
    return [];
  }

  const matchingItems = structure.items.filter(
    (item) => item.itemType === requirement.itemType,
  );
  const reservedItems = getReservedItemCountForOperationalResources(
    structure,
    requirement.itemType,
  );
  return matchingItems.slice(reservedItems);
}

export function getCraftableOperationalResourceOutput(
  structure: StructureForOperationalResources & StructureForPower,
): CraftableOperationalResourceOutput | undefined {
  if (!isStructureBuilt(structure) || !isStructurePowered(structure)) {
    return undefined;
  }

  return getStructureOperationalResourceProgresses(structure).find(
    (progress) => progress.count >= progress.requirement.maxCount,
  );
}

export function getCraftableOperationalResourceOutputs(
  structure: StructureForOperationalResources & StructureForPower,
): CraftableOperationalResourceOutput[] {
  if (!isStructureBuilt(structure) || !isStructurePowered(structure)) {
    return [];
  }

  return getStructureOperationalResourceProgresses(structure).filter(
    (progress) => progress.count >= progress.requirement.maxCount,
  );
}

export function canCraftFromStructureOperationalResources(
  structure: StructureForOperationalResources & StructureForPower,
): boolean {
  return getCraftableOperationalResourceOutput(structure) !== undefined;
}
