import {
  STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS,
  StructureOperationalResourceOutputs,
  StructureOperationalResourceRequirement,
} from "../constants/structureOperationalResources.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import { ToolType } from "../types/toolType.js";
import {
  getBuildResourceCosts,
  isStructureBuilt,
  StructureForBuild,
  StructureWithIdentifiableItems,
} from "./build.js";
import { isStructurePowered, StructureForPower } from "./power.js";

export type CraftableOperationalResourceOutput =
  | {
      kind: "tool";
      outputToolType: ToolType;
      requirement: StructureOperationalResourceRequirement;
    }
  | {
      kind: "item";
      outputItemType: ItemType;
      requirement: StructureOperationalResourceRequirement;
    };

function getAllOperationalRequirements(
  outputs: StructureOperationalResourceOutputs,
): StructureOperationalResourceRequirement[] {
  return [...Object.values(outputs.tools ?? {}), ...Object.values(outputs.items ?? {})];
}

function getStructureItemCount(structure: StructureForBuild, itemType: ItemType): number {
  return structure.items.filter((item) => item.itemType === itemType).length;
}

function getBuildResourceCount(structureType: StructureType, itemType: ItemType): number {
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
  const buildItems = getBuildResourceCount(structure.structureType, requirement.itemType);
  return Math.max(0, suppliedItems - buildItems);
}

export function getStructureOperationalResourceOutputs(
  structureType: StructureType,
): StructureOperationalResourceOutputs | undefined {
  return STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS[structureType];
}

export function getStructureOperationalResourceCount(structure: StructureForBuild): number {
  const outputs = getStructureOperationalResourceOutputs(structure.structureType);
  if (!outputs) {
    return 0;
  }

  return getAllOperationalRequirements(outputs).reduce(
    (maxCount, requirement) =>
      Math.max(maxCount, getOperationalResourceCountForRequirement(structure, requirement)),
    0,
  );
}

export function getStructureOperationalResourceLimit(structure: StructureForBuild): number {
  const outputs = getStructureOperationalResourceOutputs(structure.structureType);
  if (!outputs) {
    return 0;
  }

  return getAllOperationalRequirements(outputs).reduce(
    (maxLimit, requirement) => Math.max(maxLimit, requirement.maxCount),
    0,
  );
}

export function canAcceptOperationalResourceForStructure(
  structure: StructureForBuild & StructureForPower,
  itemType: ItemType,
): boolean {
  const outputs = getStructureOperationalResourceOutputs(structure.structureType);
  if (!outputs || !isStructureBuilt(structure) || !isStructurePowered(structure)) {
    return false;
  }

  return getAllOperationalRequirements(outputs).some(
    (requirement) =>
      requirement.itemType === itemType &&
      getOperationalResourceCountForRequirement(structure, requirement) < requirement.maxCount,
  );
}

export function getStructureOperationalResourceItems(
  structure: StructureWithIdentifiableItems,
  requirement: StructureOperationalResourceRequirement,
): { id: string; itemType: ItemType }[] {
  if (!isStructureBuilt(structure)) {
    return [];
  }

  const matchingItems = structure.items.filter((item) => item.itemType === requirement.itemType);
  const buildItems = getBuildResourceCount(structure.structureType, requirement.itemType);
  return matchingItems.slice(buildItems);
}

export function getCraftableOperationalResourceOutput(
  structure: StructureForBuild & StructureForPower,
): CraftableOperationalResourceOutput | undefined {
  const outputs = getStructureOperationalResourceOutputs(structure.structureType);
  if (!outputs || !isStructureBuilt(structure) || !isStructurePowered(structure)) {
    return undefined;
  }

  for (const [outputToolType, requirement] of Object.entries(outputs.tools ?? {}) as [
    ToolType,
    StructureOperationalResourceRequirement,
  ][]) {
    if (getOperationalResourceCountForRequirement(structure, requirement) >= requirement.maxCount) {
      return { kind: "tool", outputToolType, requirement };
    }
  }

  for (const [outputItemType, requirement] of Object.entries(outputs.items ?? {}) as [
    ItemType,
    StructureOperationalResourceRequirement,
  ][]) {
    if (getOperationalResourceCountForRequirement(structure, requirement) >= requirement.maxCount) {
      return { kind: "item", outputItemType, requirement };
    }
  }

  return undefined;
}

export function canCraftFromStructureOperationalResources(
  structure: StructureForBuild & StructureForPower,
): boolean {
  return getCraftableOperationalResourceOutput(structure) !== undefined;
}

export function getStructureOperationalResourceDisplayRequirement(
  structureType: StructureType,
): StructureOperationalResourceRequirement | undefined {
  const outputs = getStructureOperationalResourceOutputs(structureType);
  if (!outputs) {
    return undefined;
  }

  return getAllOperationalRequirements(outputs)[0];
}
