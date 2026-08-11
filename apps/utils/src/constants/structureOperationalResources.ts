import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";

export interface StructureOperationalResourceRequirement {
  itemType: ItemType;
  maxCount: number;
}

export type StructureOperationalResourceOutputs = Partial<
  Record<ItemType, StructureOperationalResourceRequirement>
>;

export const STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS: Partial<
  Record<StructureType, StructureOperationalResourceOutputs>
> = {
  stonemason: {
    brick: { itemType: "little_rock", maxCount: 3 },
  },
  woodcutter: {
    wood: { itemType: "stick", maxCount: 3 },
  },
  kitchen: {
    nettle_soup: { itemType: "leaf_part", maxCount: 2 },
    grilled_roots: { itemType: "root", maxCount: 2 },
  },
};
