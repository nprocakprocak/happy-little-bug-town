import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";

export interface StructureItemPowerRequirement {
  itemType: ItemType;
  requiredCount: number;
}

export interface StructureBugPowerRequirement {
  bugType: BugType;
  requiredCount: number;
}

export interface StructurePowerRequirement {
  bugRequirements?: StructureBugPowerRequirement[];
  itemRequirements?: StructureItemPowerRequirement[];
}

export type StructurePowerRequirementsByLevel = Record<
  number,
  StructurePowerRequirement
>;

export const STRUCTURE_POWER_REQUIREMENTS: Partial<
  Record<StructureType, StructurePowerRequirementsByLevel>
> = {
  workshop: {
    0: {
      bugRequirements: [{ bugType: "beetle", requiredCount: 2 }],
    },
  },
  stonemason: {
    0: {
      bugRequirements: [{ bugType: "beetle", requiredCount: 2 }],
      itemRequirements: [{ itemType: "hammer_and_chisel", requiredCount: 3 }],
    },
    1: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 2 }],
      itemRequirements: [{ itemType: "hammer_and_chisel", requiredCount: 3 }],
    },
  },
  woodcutter: {
    0: {
      bugRequirements: [{ bugType: "beetle", requiredCount: 2 }],
      itemRequirements: [{ itemType: "axe", requiredCount: 3 }],
    },
  },
  kitchen: {
    0: {
      bugRequirements: [{ bugType: "beetle", requiredCount: 1 }],
      itemRequirements: [{ itemType: "knife", requiredCount: 2 }],
    },
  },
  tavern: {
    0: {
      bugRequirements: [{ bugType: "beetle", requiredCount: 4 }],
    },
  },
  smelter: {
    0: {
      bugRequirements: [{ bugType: "beetle", requiredCount: 3 }],
      itemRequirements: [{ itemType: "crucible", requiredCount: 1 }],
    },
    1: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 2 }],
      itemRequirements: [{ itemType: "crucible", requiredCount: 2 }],
    },
  },
  farm: {
    0: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 3 }],
      itemRequirements: [{ itemType: "plow", requiredCount: 2 }],
    },
  },
};
