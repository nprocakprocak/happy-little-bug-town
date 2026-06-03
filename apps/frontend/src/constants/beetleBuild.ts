import { ItemType } from "../types/itemType";
import { Structure } from "../types/structure";

export const BEETLE_HOUSE_SPAN = 2;

export function hasBeetleHouse(structures: Structure[]): boolean {
  return structures.some((structure) => structure.structureType === "beetle_house");
}

export const BEETLE_BUILDING_OPTIONS: Structure[] = Array.from({ length: 5 }, (_, index) => ({
  id: `beetle-build-option-${index}`,
  x: 0,
  y: 0,
  span: BEETLE_HOUSE_SPAN,
  structureType: "beetle_house",
  items: [],
}));

export const BEETLE_BUILD_RESOURCE_COSTS = [
  { itemType: "leaf_part" as const, count: 20 },
  { itemType: "little_rock" as const, count: 15 },
  { itemType: "root" as const, count: 10 },
];

export function isBeetleHouseBuilt(structure: Structure): boolean {
  if (structure.structureType !== "beetle_house") {
    return false;
  }

  return BEETLE_BUILD_RESOURCE_COSTS.every(({ itemType, count }) => {
    const supplied = structure.items.filter((item) => item.itemType === itemType).length;
    return supplied >= count;
  });
}

export function isBeetleHouseIncomplete(structure: Structure): boolean {
  return structure.structureType === "beetle_house" && !isBeetleHouseBuilt(structure);
}

export interface BeetleHouseResourceProgress {
  itemType: ItemType;
  supplied: number;
  required: number;
  missing: number;
}

export function getBeetleHouseBuildProgress(structure: Structure): BeetleHouseResourceProgress[] {
  if (structure.structureType !== "beetle_house") {
    return [];
  }

  return BEETLE_BUILD_RESOURCE_COSTS.map(({ itemType, count: required }) => {
    const supplied = structure.items.filter((item) => item.itemType === itemType).length;
    const missing = Math.max(0, required - supplied);
    return { itemType, supplied, required, missing };
  });
}
