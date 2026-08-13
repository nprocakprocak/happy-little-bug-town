import { BuildableStructureType } from "../types/structureType.js";

const BUILDABLE_STRUCTURE_TYPE_BY_KEY: Record<BuildableStructureType, true> = {
  beetle_house: true,
  workshop: true,
  stonemason: true,
  woodcutter: true,
  kitchen: true,
  tavern: true,
};

const BUILDABLE_STRUCTURE_TYPE_SET: Set<string> = new Set(
  Object.keys(BUILDABLE_STRUCTURE_TYPE_BY_KEY),
);

export function isBuildableStructureType(
  structureType: unknown,
): structureType is BuildableStructureType {
  return typeof structureType === "string" && BUILDABLE_STRUCTURE_TYPE_SET.has(structureType);
}
