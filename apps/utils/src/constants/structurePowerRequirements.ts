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
      bugRequirements: [{ bugType: "beetle", requiredCount: 1 }],
    },
    1: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 1 }],
    },
    2: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 2 }], // spider?
    },
  },
  stonemason: {
    0: {
      bugRequirements: [{ bugType: "beetle", requiredCount: 1 }],
      itemRequirements: [{ itemType: "hammer_and_chisel", requiredCount: 2 }],
    },
    1: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 1 }],
      itemRequirements: [{ itemType: "hammer_and_chisel", requiredCount: 3 }],
    },
    2: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 2 }], // spider?
    },
  },
  woodcutter: {
    0: {
      bugRequirements: [{ bugType: "beetle", requiredCount: 1 }],
      itemRequirements: [{ itemType: "axe", requiredCount: 2 }],
    },
    1: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 1 }],
      itemRequirements: [{ itemType: "axe", requiredCount: 3 }],
    },
    2: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 2 }],
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
      bugRequirements: [{ bugType: "beetle", requiredCount: 2 }],
    },
  },
  smelter: {
    0: {
      bugRequirements: [{ bugType: "beetle", requiredCount: 1 }],
      itemRequirements: [{ itemType: "crucible", requiredCount: 1 }],
    },
    1: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 1 }],
      itemRequirements: [{ itemType: "crucible", requiredCount: 2 }],
    },
  },
  farm: {
    0: {
      bugRequirements: [{ bugType: "ladybug", requiredCount: 1 }],
      itemRequirements: [{ itemType: "hoe", requiredCount: 1 }],
    },
  },
  library: {
    0: {
      bugRequirements: [{ bugType: "spider", requiredCount: 2 }],
      itemRequirements: [{ itemType: "desk", requiredCount: 2 }],
    },
  },
  town_hall: {
    0: {
      bugRequirements: [{ bugType: "spider", requiredCount: 2 }],
      itemRequirements: [{ itemType: "book", requiredCount: 3 }],
    },
  },
};
