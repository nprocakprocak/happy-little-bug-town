import { BuildResourceCost } from "../constants/structureBuildCosts.js";
import { UpgradableStructureType } from "../types/structureType.js";
import { UPGRADE_RESOURCE_COSTS } from "../constants/structureUpgradeCosts.js";

export function getUpgradeResourceCostsForType(
  structureType: UpgradableStructureType,
): BuildResourceCost[] {
  return UPGRADE_RESOURCE_COSTS[structureType];
}
