import { BuildResourceCost } from "../constants/structureBuildCosts.js";
import { UPGRADE_RESOURCE_COSTS } from "../constants/structureUpgradeCosts.js";
import { isUpgradableStructureType } from "../typeGuards/upgradable.js";
import { ItemType } from "../types/itemType.js";
import { StructureType, UpgradableStructureType } from "../types/structureType.js";
import {
  getBuildResourceCosts,
  isStructureBuilt,
  StructureBuildItem,
  StructureBuildResourceProgress,
  StructureForBuild,
} from "./build.js";

export interface StructureForUpgrade {
  structureType: StructureType;
  upgradeLevel: number;
  items: StructureBuildItem[];
}

export function getUpgradeResourceCosts(
  structureType: StructureType,
  upgradeLevel: number,
): BuildResourceCost[] {
  if (!isUpgradableStructureType(structureType)) {
    return [];
  }
  return UPGRADE_RESOURCE_COSTS[structureType][upgradeLevel] ?? [];
}

export function getCurrentOrNextUpgradeLevel(
  structure: StructureForUpgrade,
): number {
  if (isStructureUpgradeIncomplete(structure)) {
    return structure.upgradeLevel;
  }
  return structure.upgradeLevel + 1;
}

export function getNextStructureUpgradeLevel(structure: StructureForUpgrade): number {
  return structure.upgradeLevel + 1;
}

function getReservedItemCountForUpgrade(
  structure: StructureForUpgrade,
  itemType: ItemType,
  upgradeLevel: number,
): number {
  const buildCount =
    getBuildResourceCosts(structure.structureType)?.find((cost) => cost.itemType === itemType)
      ?.count ?? 0;

  if (!isUpgradableStructureType(structure.structureType)) {
    return buildCount;
  }

  let previousUpgradeCount = 0;
  for (let level = 1; level < upgradeLevel; level++) {
    previousUpgradeCount +=
      UPGRADE_RESOURCE_COSTS[structure.structureType][level]?.find(
        (cost) => cost.itemType === itemType,
      )?.count ?? 0;
  }

  return buildCount + previousUpgradeCount;
}

export function getStructureUpgradeProgress(
  structure: StructureForUpgrade,
): StructureBuildResourceProgress[] {
  const costs = getUpgradeResourceCosts(structure.structureType, structure.upgradeLevel);
  if (!costs) {
    return [];
  }

  return costs.map(({ itemType, count: required }) => {
    const supplied = Math.max(
      0,
      structure.items.filter((item) => item.itemType === itemType).length -
        getReservedItemCountForUpgrade(structure, itemType, structure.upgradeLevel),
    );
    const missing = Math.max(0, required - supplied);
    return { itemType, supplied, required, missing };
  });
}

export function isStructureUpgradeIncomplete(structure: StructureForUpgrade): boolean {
  if (structure.upgradeLevel <= 0) {
    return false;
  }
  const progress = getStructureUpgradeProgress(structure);
  if (progress.length === 0) {
    return false;
  }
  return progress.some(({ missing }) => missing > 0);
}

export function canAcceptItemForUpgrade(
  structure: StructureForUpgrade & StructureForBuild,
  itemType: ItemType,
): boolean {
  if (!isStructureBuilt(structure) || !isStructureUpgradeIncomplete(structure)) {
    return false;
  }

  const resourceProgress = getStructureUpgradeProgress(structure).find(
    (progress) => progress.itemType === itemType,
  );

  return resourceProgress !== undefined && resourceProgress.missing > 0;
}

export function canStartStructureUpgrade(
  structure: StructureForUpgrade & StructureForBuild,
): boolean {
  if (!isUpgradableStructureType(structure.structureType)) {
    return false;
  }
  if (!isStructureBuilt(structure) || isStructureUpgradeIncomplete(structure)) {
    return false;
  }
  const nextLevel = structure.upgradeLevel + 1;
  const costs = UPGRADE_RESOURCE_COSTS[structure.structureType][nextLevel];
  return costs !== undefined && costs.length > 0;
}
