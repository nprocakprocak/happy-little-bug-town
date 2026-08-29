import { UpgradableStructureType } from "../types/structureType.js";

const UPGRADABLE_STRUCTURE_TYPE_BY_KEY: Record<UpgradableStructureType, true> = {
  workshop: true,
  stonemason: true,
  woodcutter: true,
  kitchen: true,
  smelter: true,
};

export const UPGRADABLE_STRUCTURE_TYPES = Object.keys(
  UPGRADABLE_STRUCTURE_TYPE_BY_KEY,
) as UpgradableStructureType[];

const UPGRADABLE_STRUCTURE_TYPE_SET: Set<string> = new Set(
  UPGRADABLE_STRUCTURE_TYPES,
);

export function isUpgradableStructureType(
  structureType: unknown,
): structureType is UpgradableStructureType {
  return typeof structureType === "string" && UPGRADABLE_STRUCTURE_TYPE_SET.has(structureType);
}
