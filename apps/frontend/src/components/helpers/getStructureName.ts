import { StructureType } from "@happy-little-bug-town/utils";

import { Structure } from "../../types/structure";

export function structureTypeToName(structureType: StructureType): string {
  switch (structureType) {
    case "beetle_house":
      return "Beetle house";
    case "greenfly_house":
      return "Greenfly house";
    case "workshop":
      return "Workshop";
    case "stonemason":
      return "Stonemason";
    case "woodcutter":
      return "Woodcutter";
    case "kitchen":
      return "Kitchen";
    case "tavern":
      return "Tavern";
    case "smelter":
      return "Smelter";
    case "farm":
      return "Farm";
    case "mushrooms_field":
      return "Mushroom field";
    default:
      throw new Error(`Unknown structure type: ${structureType}`);
  }
}

export function getStructureName(structure: Structure): string {
  return structureTypeToName(structure.structureType);
}
