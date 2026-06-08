import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import { ToolType } from "../types/toolType.js";

export interface StructureOperationalResourceRequirement {
  itemType: ItemType;
  maxCount: number;
}

export type StructureOperationalResourceOutputs = Partial<
  Record<ToolType, StructureOperationalResourceRequirement>
>;

export const STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS: Partial<
  Record<StructureType, StructureOperationalResourceOutputs>
> = {
  stonemason: {
    brick: { itemType: "little_rock", maxCount: 3 },
  },
};
