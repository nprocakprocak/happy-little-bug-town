import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import { ToolType } from "../types/toolType.js";

export interface StructureOperationalResourceRequirement {
  itemType: ItemType;
  maxCount: number;
}

export interface StructureOperationalResourceOutputs {
  tools?: Partial<Record<ToolType, StructureOperationalResourceRequirement>>;
  items?: Partial<Record<ItemType, StructureOperationalResourceRequirement>>;
}

export const STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS: Partial<
  Record<StructureType, StructureOperationalResourceOutputs>
> = {
  stonemason: {
    items: {
      brick: { itemType: "little_rock", maxCount: 3 },
    },
  },
  woodcutter: {
    tools: {
      wood: { itemType: "stick", maxCount: 3 },
    },
  },
};
