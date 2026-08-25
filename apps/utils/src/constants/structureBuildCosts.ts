import { BuildableStructureType } from "../types/structureType.js";
import { ItemType } from "../types/itemType.js";

export interface BuildResourceCost {
  itemType: ItemType;
  count: number;
}

export const BEETLE_HOUSE_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 3 },
  { itemType: "little_rock", count: 3 },
  { itemType: "stick", count: 3 },
];

export const GREENFLY_HOUSE_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "roof_tile", count: 1 },
  { itemType: "wood", count: 1 },
  { itemType: "brick", count: 1 },
  { itemType: "leaf_part", count: 4 },
];

export const WORKSHOP_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 5 },
  { itemType: "little_rock", count: 3 },
  { itemType: "stick", count: 3 },
  { itemType: "root", count: 3 },
];

export const STONEMASON_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 3 },
  { itemType: "little_rock", count: 5 },
  { itemType: "stick", count: 2 },
  { itemType: "root", count: 2 },
];

export const WOODCUTTER_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 3 },
  { itemType: "root", count: 3 },
  { itemType: "stick", count: 2 },
  { itemType: "brick", count: 3 },
];

export const KITCHEN_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 5 },
  { itemType: "brick", count: 3 },
  { itemType: "wood", count: 3 },
];

export const TAVERN_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 3 },
  { itemType: "brick", count: 4 },
  { itemType: "wood", count: 4 },
];

export const SMELTER_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "leaf_part", count: 2 },
  { itemType: "brick", count: 5 },
  { itemType: "wood", count: 2 },
  { itemType: "glass", count: 2 },
];

export const FARM_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "plank", count: 2 },
  { itemType: "paving_stone", count: 2 },
  { itemType: "glass", count: 2 },
  { itemType: "roof_tile", count: 2 },
];

export const MUSHROOMS_FIELD_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "paper", count: 2 },
  { itemType: "clay", count: 2 },
  { itemType: "root", count: 2 },
];

export const BUILD_RESOURCE_COSTS: Record<
  BuildableStructureType,
  BuildResourceCost[]
> = {
  beetle_house: BEETLE_HOUSE_BUILD_COSTS,
  greenfly_house: GREENFLY_HOUSE_BUILD_COSTS,
  workshop: WORKSHOP_BUILD_COSTS,
  stonemason: STONEMASON_BUILD_COSTS,
  woodcutter: WOODCUTTER_BUILD_COSTS,
  kitchen: KITCHEN_BUILD_COSTS,
  tavern: TAVERN_BUILD_COSTS,
  smelter: SMELTER_BUILD_COSTS,
  farm: FARM_BUILD_COSTS,
  mushrooms_field: MUSHROOMS_FIELD_BUILD_COSTS,
};
