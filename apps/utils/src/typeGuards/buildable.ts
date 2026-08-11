import { BuildableStructureType, StructureType } from "../types/structureType.js";

export function isBuildableStructureType(
  structureType: StructureType,
): structureType is BuildableStructureType {
  return (
    ["beetle_house", "workshop", "stonemason", "woodcutter", "kitchen", "tavern"].includes(structureType)
  );
}
