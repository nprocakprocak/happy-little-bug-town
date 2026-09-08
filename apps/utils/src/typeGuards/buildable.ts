import {
  BuildableStructureType,
  FarmBuildableStructureType,
} from "../types/structureType.js";

type NonFarmBuildableStructureType = Exclude<
  BuildableStructureType,
  FarmBuildableStructureType
>;

const BUILDABLE_STRUCTURE_TYPE_BY_KEY: Record<
  NonFarmBuildableStructureType,
  true
> = {
  beetle_house: true,
  workshop: true,
  woodcutter: true,
  stonemason: true,
  kitchen: true,
  tavern: true,
  smelter: true,
  greenfly_house: true,
  farm: true,
  library: true,
  town_hall: true,
};

const FARM_BUILDABLE_STRUCTURE_TYPE_BY_KEY: Record<
  FarmBuildableStructureType,
  true
> = {
  mushrooms_field: true,
  flowers_field: true,
  composter: true,
};

export const BUILDABLE_STRUCTURE_TYPES = Object.keys(
  BUILDABLE_STRUCTURE_TYPE_BY_KEY,
) as NonFarmBuildableStructureType[];

export const FARM_BUILDABLE_STRUCTURE_TYPES = Object.keys(
  FARM_BUILDABLE_STRUCTURE_TYPE_BY_KEY,
) as FarmBuildableStructureType[];

const BUILDABLE_STRUCTURE_TYPE_SET: Set<string> = new Set([
  ...BUILDABLE_STRUCTURE_TYPES,
  ...FARM_BUILDABLE_STRUCTURE_TYPES,
]);

const FARM_BUILDABLE_STRUCTURE_TYPE_SET: Set<string> = new Set(
  FARM_BUILDABLE_STRUCTURE_TYPES,
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
