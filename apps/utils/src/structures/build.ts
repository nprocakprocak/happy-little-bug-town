import { BEETLE_HOUSE_SPAN, WORKSHOP_SPAN } from "../constants/game.js";
import {
  BUILD_RESOURCE_COSTS,
  BuildResourceCost,
} from "../constants/structureBuildCosts.js";
import { ItemType } from "../types/itemType.js";
import {
  BuildableStructureType,
  StructureType,
} from "../types/structureType.js";
import { isBuildableStructureType } from "../typeGuards/buildable.js";

export interface StructureBuildItem {
  itemType: ItemType;
}

export interface StructureForBuild {
  structureType: StructureType;
  items: StructureBuildItem[];
}

export interface StructureBuildResourceProgress {
  itemType: ItemType;
  supplied: number;
  required: number;
  missing: number;
}

export function hasStructureType<T extends { structureType: StructureType }>(
  structures: T[],
  structureType: StructureType,
): boolean {
  return structures.some((structure) => structure.structureType === structureType);
}

export function getBuildResourceCosts(
  structureType: StructureType,
): BuildResourceCost[] | undefined {
  if (isBuildableStructureType(structureType)) {
    return BUILD_RESOURCE_COSTS[structureType];
  }
  return undefined;
}

export function getBuildResourceCostsForType(
  structureType: BuildableStructureType,
): BuildResourceCost[] {
  return BUILD_RESOURCE_COSTS[structureType];
}

export function getStructureSpan(structureType: BuildableStructureType): number {
  return structureType === "workshop" ? WORKSHOP_SPAN : BEETLE_HOUSE_SPAN;
}

export function isStructureBuilt(structure: StructureForBuild): boolean {
  if (structure.structureType === "hole") {
    return true;
  }

  const costs = getBuildResourceCosts(structure.structureType);
  if (!costs) {
    return false;
  }

  return costs.every(({ itemType, count }) => {
    const supplied = structure.items.filter((item) => item.itemType === itemType).length;
    return supplied >= count;
  });
}

export function isStructureIncomplete(structure: StructureForBuild): boolean {
  return !isStructureBuilt(structure);
}

export function getStructureBuildProgress(
  structure: StructureForBuild,
): StructureBuildResourceProgress[] {
  const costs = getBuildResourceCosts(structure.structureType);
  if (!costs) {
    return [];
  }

  return costs.map(({ itemType, count: required }) => {
    const supplied = structure.items.filter((item) => item.itemType === itemType).length;
    const missing = Math.max(0, required - supplied);
    return { itemType, supplied, required, missing };
  });
}

export function canAcceptItemForBuild(
  structure: StructureForBuild,
  itemType: ItemType,
): boolean {
  if (!isStructureIncomplete(structure)) {
    return false;
  }

  const resourceProgress = getStructureBuildProgress(structure).find(
    (progress) => progress.itemType === itemType,
  );

  return resourceProgress !== undefined && resourceProgress.missing > 0;
}

export function canDropItemOnStructure(
  item: { itemType: ItemType },
  structure: StructureForBuild,
): boolean {
  return canAcceptItemForBuild(structure, item.itemType);
}
