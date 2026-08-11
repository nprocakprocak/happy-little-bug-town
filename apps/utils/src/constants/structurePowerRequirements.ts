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
  workshop: { requiredCount: 2, occupantBugType: "beetle" },
  stonemason: {
    requiredCount: 2,
    occupantBugType: "beetle",
    itemRequirements: [{ itemType: "hammer_and_chisel", requiredCount: 3 }],
  },
  woodcutter: {
    requiredCount: 2,
    occupantBugType: "beetle",
    itemRequirements: [{ itemType: "axe", requiredCount: 3 }],
  },
  kitchen: {
    requiredCount: 1,
    occupantBugType: "beetle",
    itemRequirements: [{ itemType: "knife", requiredCount: 2 }],
  },
  tavern: {
    requiredCount: 4,
    occupantBugType: "beetle",
  },
};
