import { Structure } from "../../types/structure";
import { StructureType } from "../../types/structureType";

export function structureTypeToName(structureType: StructureType): string {
  switch (structureType) {
    case "hole":
      return "Hole in the ground";
    case "beetle-house":
      return "Beetle house";
    default:
      throw new Error(`Unknown structure type: ${structureType}`);
  }
}

export function getStructureName(structure: Structure): string {
  return structureTypeToName(structure.structureType);
}
