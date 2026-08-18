import { UpgradableStructureType } from "../types/structureType.js";
import { BuildResourceCost } from "./structureBuildCosts.js";

export const STONEMASON_LVL_2_BUILD_COSTS: BuildResourceCost[] = [
  { itemType: "wood", count: 1 },
  { itemType: "brick", count: 2 },
  { itemType: "glass", count: 2 },
  { itemType: "roof_tile", count: 2 },
];

export const UPGRADE_RESOURCE_COSTS: Record<
  UpgradableStructureType,
  BuildResourceCost[]
> = {
  stonemason: STONEMASON_LVL_2_BUILD_COSTS,
};
