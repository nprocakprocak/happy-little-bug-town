import {
  STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS,
  StructureOperationalBugRequirement,
  StructureOperationalItemRequirement,
  StructureOperationalOutputType,
  StructureOperationalResourceOutputs,
  StructureOperationalResourceRequirement,
} from "../constants/structureOperationalResources.js";
import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import {
  isStructureBuilt,
  StructureForBuild,
  StructureWithIdentifiableItems,
} from "./build.js";
import {
  getOperationalUpgradeLevel,
  getStructureBugPowerRequirements,
  isStructureOperationallyPowered,
  StructureForPower,
} from "./power.js";
import { getAssignedTermiteCapacity } from "./termiteAssignment.js";
import { getReservedItemCountForOperationalResources, StructureForUpgrade } from "./upgrade.js";

export interface CraftableOperationalResourceOutput {
  outputType: StructureOperationalOutputType;
  requirement: StructureOperationalResourceRequirement;
}

export interface StructureOperationalResourceProgress {
  outputType: StructureOperationalOutputType;
  requirement: StructureOperationalResourceRequirement;
  count: number;
}

export interface StructureWithIdentifiableBugs {
  bugs: { id: string; bugType: BugType }[];
}

export type StructureForOperationalResources = StructureForBuild &
  StructureForUpgrade & {
    bugs: { bugType: BugType }[];
  };

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

export function isOperationalItemRequirement(
  requirement: StructureOperationalResourceRequirement,
): requirement is StructureOperationalItemRequirement {
  return "itemType" in requirement;
}

export function isOperationalBugRequirement(
  requirement: StructureOperationalResourceRequirement,
): requirement is StructureOperationalBugRequirement {
  return "bugType" in requirement;
}

function getStructureItemCount(
  structure: StructureForBuild,
  itemType: ItemType,
): number {
  return structure.items.filter((item) => item.itemType === itemType).length;
}

function getStructureBugCount(
  structure: StructureForOperationalResources,
  bugType: BugType,
): number {
  return structure.bugs.filter((bug) => bug.bugType === bugType).length;
}

function getReservedBugCountForOperationalResources(
  structure: StructureForOperationalResources,
  bugType: BugType,
): number {
  const powerRequired =
    getStructureBugPowerRequirements(
      structure.structureType,
      getOperationalUpgradeLevel(structure),
    ).find((requirement) => requirement.bugType === bugType)?.requiredCount ?? 0;
  const termiteReserved =
    bugType === "termite"
      ? getAssignedTermiteCapacity(structure.structureType)
      : 0;
  return powerRequired + termiteReserved;
}

function getOperationalResourceCountForRequirement(
  structure: StructureForOperationalResources,
  requirement: StructureOperationalResourceRequirement,
): number {
  if (!isStructureBuilt(structure)) {
    return 0;
  }

  if (isOperationalBugRequirement(requirement)) {
    const suppliedBugs = getStructureBugCount(structure, requirement.bugType);
    const reservedBugs = getReservedBugCountForOperationalResources(
      structure,
      requirement.bugType,
    );
    return Math.max(0, suppliedBugs - reservedBugs);
  }

  const suppliedItems = getStructureItemCount(structure, requirement.itemType);
  const reservedItems = getReservedItemCountForOperationalResources(
    structure,
    requirement.itemType,
  );
  return Math.max(0, suppliedItems - reservedItems);
}

export function getStructureOperationalResourceOutputs(
  structure: StructureForOperationalResources,
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

function canAcceptOperationalRequirement(
  structure: StructureForOperationalResources & StructureForPower,
  matchesRequirement: (
    requirement: StructureOperationalResourceRequirement,
  ) => boolean,
): boolean {
  const outputs = getStructureOperationalResourceOutputs(structure);
  if (
    !outputs ||
    !isStructureBuilt(structure) ||
    !isStructureOperationallyPowered(structure)
  ) {
    return false;
  }

  return getAllOperationalRequirements(outputs).some(
    (requirement) =>
      matchesRequirement(requirement) &&
      getOperationalResourceCountForRequirement(structure, requirement) <
        requirement.maxCount,
  );
}

export function canAcceptOperationalResourceForStructure(
  structure: StructureForOperationalResources & StructureForPower,
  itemType: ItemType,
): boolean {
  return canAcceptOperationalRequirement(
    structure,
    (requirement) =>
      isOperationalItemRequirement(requirement) &&
      requirement.itemType === itemType,
  );
}

export function canAcceptOperationalBugForStructure(
  structure: StructureForOperationalResources & StructureForPower,
  bugType: BugType,
): boolean {
  return canAcceptOperationalRequirement(
    structure,
    (requirement) =>
      isOperationalBugRequirement(requirement) &&
      requirement.bugType === bugType,
  );
}

export function getStructureOperationalResourceItems(
  structure: StructureWithIdentifiableItems & StructureForUpgrade,
  requirement: StructureOperationalResourceRequirement,
): { id: string; itemType: ItemType }[] {
  if (
    !isStructureBuilt(structure) ||
    !isOperationalItemRequirement(requirement)
  ) {
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

export function getStructureOperationalResourceBugs(
  structure: StructureWithIdentifiableBugs & StructureForOperationalResources,
  requirement: StructureOperationalResourceRequirement,
): { id: string; bugType: BugType }[] {
  if (
    !isStructureBuilt(structure) ||
    !isOperationalBugRequirement(requirement)
  ) {
    return [];
  }

  const matchingBugs = structure.bugs.filter(
    (bug) => bug.bugType === requirement.bugType,
  );
  const reservedBugs = getReservedBugCountForOperationalResources(
    structure,
    requirement.bugType,
  );
  return matchingBugs.slice(reservedBugs);
}

export function getCraftableOperationalResourceOutput(
  structure: StructureForOperationalResources & StructureForPower,
): CraftableOperationalResourceOutput | undefined {
  if (!isStructureBuilt(structure) || !isStructureOperationallyPowered(structure)) {
    return undefined;
  }

  return getStructureOperationalResourceProgresses(structure).find(
    (progress) => progress.count >= progress.requirement.maxCount,
  );
}

export function getCraftableOperationalResourceOutputs(
  structure: StructureForOperationalResources & StructureForPower,
): CraftableOperationalResourceOutput[] {
  if (!isStructureBuilt(structure) || !isStructureOperationallyPowered(structure)) {
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
