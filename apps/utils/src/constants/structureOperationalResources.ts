import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";

export interface StructureOperationalResourceRequirement {
  itemType: ItemType;
  maxCount: number;
}

export const STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS: Partial<
  Record<StructureType, StructureOperationalResourceRequirement>
> = {
  stonemason: { itemType: "little_rock", maxCount: 3 },
};
