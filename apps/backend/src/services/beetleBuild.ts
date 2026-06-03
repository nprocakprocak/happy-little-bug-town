import { ItemType } from "../prisma/prisma/client.js";
import { StructureDto } from "../types/structureDto.js";

export const BEETLE_BUILD_RESOURCE_COSTS: { itemType: ItemType; count: number }[] = [
  { itemType: "leaf_part", count: 20 },
  { itemType: "little_rock", count: 15 },
  { itemType: "root", count: 10 },
];

export function isBeetleHouseBuilt(structure: StructureDto): boolean {
  if (structure.structureType !== "beetle_house") {
    return false;
  }

  return BEETLE_BUILD_RESOURCE_COSTS.every(({ itemType, count }) => {
    const supplied = structure.items.filter((item) => item.itemType === itemType).length;
    return supplied >= count;
  });
}

export function isBeetleHouseIncomplete(structure: StructureDto): boolean {
  return structure.structureType === "beetle_house" && !isBeetleHouseBuilt(structure);
}

export function canAcceptItemForBuild(structure: StructureDto, itemType: ItemType): boolean {
  if (!isBeetleHouseIncomplete(structure)) {
    return false;
  }

  const cost = BEETLE_BUILD_RESOURCE_COSTS.find((entry) => entry.itemType === itemType);
  if (!cost) {
    return false;
  }

  const supplied = structure.items.filter((item) => item.itemType === itemType).length;
  return supplied < cost.count;
}
