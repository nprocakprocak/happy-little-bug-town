import { StructureType } from "@happy-little-park/utils";

import { Structure } from "../../types/structure";

export function structureTypeToName(structureType: StructureType): string {
  switch (structureType) {
    case "hole":
      return "Hole in the ground";
    case "beetle_house":
      return "Beetle house";
    case "workshop":
      return "Workshop";
    case "stonemason":
      return "Stonemason";
    default:
      throw new Error(`Unknown structure type: ${structureType}`);
  }
}

export function getStructureName(structure: Structure): string {
  return structureTypeToName(structure.structureType);
}
