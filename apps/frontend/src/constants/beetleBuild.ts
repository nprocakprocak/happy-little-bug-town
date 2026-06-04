import { BuildableStructureType, StructureType } from "@happy-little-park/utils";

import { BugType } from "../types/bugType";
import { ItemType } from "../types/itemType";
import { Structure } from "../types/structure";

export const BEETLE_HOUSE_SPAN = 2;
export const WORKSHOP_SPAN = 2;

export function hasStructureType(structures: Structure[], structureType: StructureType): boolean {
  return structures.some((structure) => structure.structureType === structureType);
}

const BUILDABLE_STRUCTURE_TYPES: BuildableStructureType[] = ["beetle_house", "workshop"];

export const BUILDING_OPTIONS: Structure[] = BUILDABLE_STRUCTURE_TYPES.map<Structure>(
  (structureType) => ({
    id: `build-option-${structureType}`,
    x: 0,
    y: 0,
    span: 1,
    structureType,
    items: [],
    bugs: [],
  }),
);

export const BEETLE_HOUSE_COSTS = [
  { itemType: "leaf_part" as const, count: 20 },
  { itemType: "little_rock" as const, count: 15 },
  { itemType: "root" as const, count: 10 },
];

export const WORKSHOP_COSTS = [
  { itemType: "leaf_part" as const, count: 30 },
  { itemType: "little_rock" as const, count: 30 },
  { itemType: "root" as const, count: 20 },
];

const BUILD_RESOURCE_COSTS: Record<
  BuildableStructureType,
  { itemType: ItemType; count: number }[]
> = {
  beetle_house: BEETLE_HOUSE_COSTS,
  workshop: WORKSHOP_COSTS,
};

function getBuildResourceCosts(
  structureType: StructureType,
): { itemType: ItemType; count: number }[] | undefined {
  if (structureType === "beetle_house" || structureType === "workshop") {
    return BUILD_RESOURCE_COSTS[structureType];
  }
  return undefined;
}

export function getStructureSpan(structureType: BuildableStructureType): number {
  return structureType === "workshop" ? WORKSHOP_SPAN : BEETLE_HOUSE_SPAN;
}

export function isStructureBuilt(structure: Structure): boolean {
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

export function isBeetleHouseBuilt(structure: Structure): boolean {
  if (structure.structureType !== "beetle_house") {
    return false;
  }

  return isStructureBuilt(structure);
}

export function isStructureIncomplete(structure: Structure): boolean {
  return !isStructureBuilt(structure);
}

export interface StructureBuildResourceProgress {
  itemType: ItemType;
  supplied: number;
  required: number;
  missing: number;
}

export function getStructureBuildProgress(structure: Structure): StructureBuildResourceProgress[] {
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

export function canDropItemOnStructure(
  item: { itemType: ItemType },
  structure: Structure,
): boolean {
  if (!isStructureIncomplete(structure)) {
    return false;
  }

  const resourceProgress = getStructureBuildProgress(structure).find(
    (progress) => progress.itemType === item.itemType,
  );

  return resourceProgress !== undefined && resourceProgress.missing > 0;
}

export function canDropBeetleOnStructure(bug: { bugType: BugType }, structure: Structure): boolean {
  return bug.bugType === "beetle" && isBeetleHouseBuilt(structure);
}

export function getBuildResourceCostsForType(
  structureType: BuildableStructureType,
): { itemType: ItemType; count: number }[] {
  return BUILD_RESOURCE_COSTS[structureType];
}
