import { BuildableStructureType, StructureType } from "../types/structureType.js";

export function isBuildableStructureType(
  structureType: StructureType,
): structureType is BuildableStructureType {
  return (
    structureType === "beetle_house" ||
    structureType === "workshop" ||
    structureType === "stonemason" ||
    structureType === "woodcutter" ||
    structureType === "kitchen"
  );
}
