import {
  BuildableStructureType,
  FarmBuildableStructureType,
} from "../types/structureType.js";

const BUILDABLE_STRUCTURE_TYPE_BY_KEY: Record<BuildableStructureType, true> = {
  beetle_house: true,
  greenfly_house: true,
  workshop: true,
  stonemason: true,
  woodcutter: true,
  kitchen: true,
  tavern: true,
  smelter: true,
  farm: true,
  library: true,
  town_hall: true,
  mushrooms_field: true,
  composter: true,
};

const FARM_BUILDABLE_STRUCTURE_TYPE_BY_KEY: Record<
  FarmBuildableStructureType,
  true
> = {
  mushrooms_field: true,
  composter: true,
};

const BUILDABLE_STRUCTURE_TYPE_SET: Set<string> = new Set(
  Object.keys(BUILDABLE_STRUCTURE_TYPE_BY_KEY),
);

const FARM_BUILDABLE_STRUCTURE_TYPE_SET: Set<string> = new Set(
  Object.keys(FARM_BUILDABLE_STRUCTURE_TYPE_BY_KEY),
);

export function isBuildableStructureType(
  structureType: unknown,
): structureType is BuildableStructureType {
  return typeof structureType === "string" && BUILDABLE_STRUCTURE_TYPE_SET.has(structureType);
}

export function isFarmBuildableStructureType(
  structureType: unknown,
): structureType is FarmBuildableStructureType {
  return (
    typeof structureType === "string" &&
    FARM_BUILDABLE_STRUCTURE_TYPE_SET.has(structureType)
  );
}
