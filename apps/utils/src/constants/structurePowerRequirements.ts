import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";

export interface StructureItemPowerRequirement {
  itemType: ItemType;
  requiredCount: number;
}

export interface StructurePowerRequirement {
  requiredCount: number;
  occupantBugType: BugType;
  itemRequirements?: StructureItemPowerRequirement[];
}

export const STRUCTURE_POWER_REQUIREMENTS: Partial<
  Record<StructureType, StructurePowerRequirement>
> = {
  workshop: { requiredCount: 10, occupantBugType: "beetle" },
  stonemason: {
    requiredCount: 10,
    occupantBugType: "beetle",
    itemRequirements: [{ itemType: "hammer_and_chisel", requiredCount: 3 }],
  },
  woodcutter: {
    requiredCount: 10,
    occupantBugType: "beetle",
    itemRequirements: [{ itemType: "axe", requiredCount: 3 }],
  },
};
