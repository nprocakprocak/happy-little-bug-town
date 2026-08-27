import { UpgradableStructureType } from "../types/structureType.js";

const UPGRADABLE_STRUCTURE_TYPE_BY_KEY: Record<UpgradableStructureType, true> = {
  stonemason: true,
  woodcutter: true,
  kitchen: true,
  smelter: true,
};

const UPGRADABLE_STRUCTURE_TYPE_SET: Set<string> = new Set(
  Object.keys(UPGRADABLE_STRUCTURE_TYPE_BY_KEY),
);

export function isUpgradableStructureType(
  structureType: unknown,
): structureType is UpgradableStructureType {
  return typeof structureType === "string" && UPGRADABLE_STRUCTURE_TYPE_SET.has(structureType);
}
