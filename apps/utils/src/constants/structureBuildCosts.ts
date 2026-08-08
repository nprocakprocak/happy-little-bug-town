import { BuildableStructureType } from "../types/structureType.js";
import { ItemType } from "../types/itemType.js";

export interface BuildResourceCost {
  itemType: ItemType;
  count: number;
}

export const BEETLE_HOUSE_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 10 },
  { itemType: "little_rock", count: 10 },
  { itemType: "stick", count: 5 },
];

export const WORKSHOP_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 20 },
  { itemType: "little_rock", count: 10 },
  { itemType: "stick", count: 10 },
  { itemType: "root", count: 5 },
];

export const STONEMASON_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 10 },
  { itemType: "little_rock", count: 10 },
  { itemType: "stick", count: 10 },
  { itemType: "root", count: 5 },
];

export const WOODCUTTER_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 10 },
  { itemType: "root", count: 5 },
  { itemType: "stick", count: 5 },
  { itemType: "brick", count: 5 },
];

export const KITCHEN_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 5 },
  { itemType: "brick", count: 3 },
  { itemType: "wood", count: 3 },
];

export const BUILD_RESOURCE_COSTS: Record<
  BuildableStructureType,
  BuildResourceCost[]
> = {
  beetle_house: BEETLE_HOUSE_BUILD_COSTS,
  workshop: WORKSHOP_BUILD_COSTS,
  stonemason: STONEMASON_BUILD_COSTS,
  woodcutter: WOODCUTTER_BUILD_COSTS,
  kitchen: KITCHEN_BUILD_COSTS,
};
