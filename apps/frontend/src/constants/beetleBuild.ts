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
}));

export const BEETLE_BUILD_RESOURCE_COSTS = [
  { itemType: "leaf_part" as const, count: 20 },
  { itemType: "little_rock" as const, count: 15 },
  { itemType: "stick" as const, count: 10 },
];
