import { BuildableStructureType } from "../types/structureType.js";
import { ItemType } from "../types/itemType.js";

export interface BuildResourceCost {
  itemType: ItemType;
  count: number;
}

export const BEETLE_HOUSE_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 20 },
  { itemType: "little_rock", count: 15 },
  { itemType: "root", count: 10 },
];

export const WORKSHOP_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 30 },
  { itemType: "little_rock", count: 30 },
  { itemType: "root", count: 20 },
];

export const BUILD_RESOURCE_COSTS: Record<BuildableStructureType, BuildResourceCost[]> = {
  beetle_house: BEETLE_HOUSE_BUILD_COSTS,
  workshop: WORKSHOP_BUILD_COSTS,
};
