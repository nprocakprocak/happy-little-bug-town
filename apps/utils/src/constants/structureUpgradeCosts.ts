import { UpgradableStructureType } from "../types/structureType.js";
import { BuildResourceCost } from "./structureBuildCosts.js";

export const WORKSHOP_LVL_2_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "wood", count: 1 },
  { itemType: "brick", count: 1 },
  { itemType: "iron_ingot", count: 1 },
  { itemType: "glass", count: 1 },
];

export const WORKSHOP_LVL_3_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "concrete", count: 1 },
  { itemType: "steel", count: 1 },
  { itemType: "glass", count: 1 },
  { itemType: "furniture", count: 1 },
];

export const STONEMASON_LVL_2_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "wood", count: 1 },
  { itemType: "brick", count: 2 },
  { itemType: "glass", count: 2 },
  { itemType: "roof_tile", count: 2 },
];

export const WOODCUTTER_LVL_2_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "wood", count: 1 },
  { itemType: "paving_stone", count: 1 },
  { itemType: "glass", count: 2 },
  { itemType: "roof_tile", count: 2 },
];

export const STONEMASON_LVL_3_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "concrete", count: 2 },
  { itemType: "steel", count: 1 },
  { itemType: "plank", count: 1 },
  { itemType: "glass", count: 1 },
];

export const WOODCUTTER_LVL_3_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "concrete", count: 2 },
  { itemType: "steel", count: 1 },
  { itemType: "paving_stone", count: 1 },
  { itemType: "glass", count: 1 },
];

export const KITCHEN_LVL_2_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "plank", count: 1 },
  { itemType: "paving_stone", count: 1 },
  { itemType: "iron_ingot", count: 1 },
  { itemType: "glass", count: 1 },
];

export const SMELTER_LVL_2_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "iron_ingot", count: 2 },
  { itemType: "paving_stone", count: 1 },
  { itemType: "roof_tile", count: 1 },
  { itemType: "gravel", count: 2 },
];

export const UPGRADE_RESOURCE_COSTS: Record<
  UpgradableStructureType,
  Record<number, BuildResourceCost[]>
> = {
  workshop: {
    1: WORKSHOP_LVL_2_BUILD_COSTS,
    2: WORKSHOP_LVL_3_BUILD_COSTS,
  },
  stonemason: {
    1: STONEMASON_LVL_2_BUILD_COSTS,
    2: STONEMASON_LVL_3_BUILD_COSTS,
  },
  woodcutter: {
    1: WOODCUTTER_LVL_2_BUILD_COSTS,
    2: WOODCUTTER_LVL_3_BUILD_COSTS,
  },
  kitchen: {
    1: KITCHEN_LVL_2_BUILD_COSTS,
  },
  smelter: {
    1: SMELTER_LVL_2_BUILD_COSTS,
  },
};
