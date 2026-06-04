import { BuildableStructureType, isBuildableStructureType } from "@happy-little-park/utils";
import { ItemType } from "../prisma/prisma/client.js";
import { StructureDto } from "../types/structureDto.js";

type BuildResourceCosts = {
  itemType: ItemType;
  count: number;
};

export const BEETLE_BUILD_RESOURCE_COSTS: BuildResourceCosts[] = [
  { itemType: "leaf_part", count: 20 },
  { itemType: "little_rock", count: 15 },
  { itemType: "root", count: 10 },
];

export const WORKSHOP_RESOURCE_COSTS: BuildResourceCosts[] = [
  { itemType: "leaf_part", count: 30 },
  { itemType: "little_rock", count: 30 },
  { itemType: "root", count: 20 },
];

const BUILD_RESOURCE_COSTS: Record<
  BuildableStructureType,
  BuildResourceCosts[]
> = {
  beetle_house: BEETLE_BUILD_RESOURCE_COSTS,
  workshop: WORKSHOP_RESOURCE_COSTS,
};

function getBuildResourceCosts(
  structureType: StructureDto["structureType"],
): { itemType: ItemType; count: number }[] | undefined {
  if (isBuildableStructureType(structureType)) {
    return BUILD_RESOURCE_COSTS[structureType];
  }
  return undefined;
}

export function isStructureBuilt(structure: StructureDto): boolean {
  const costs = getBuildResourceCosts(structure.structureType);
  if (!costs) {
    return false;
  }

  return costs.every(({ itemType, count }) => {
    const supplied = structure.items.filter(
      (item) => item.itemType === itemType,
    ).length;
    return supplied >= count;
  });
}

export function canAcceptItemForBuild(
  structure: StructureDto,
  itemType: ItemType,
): boolean {
  if (isStructureBuilt(structure)) {
    return false;
  }

  const costs = getBuildResourceCosts(structure.structureType);
  if (!costs) {
    return false;
  }

  const cost = costs.find((entry) => entry.itemType === itemType);
  if (!cost) {
    return false;
  }

  const supplied = structure.items.filter(
    (item) => item.itemType === itemType,
  ).length;
  return supplied < cost.count;
}
