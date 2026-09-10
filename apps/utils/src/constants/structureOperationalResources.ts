import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";

export interface StructureOperationalItemRequirement {
  itemType: ItemType;
  maxCount: number;
}

export interface StructureOperationalBugRequirement {
  bugType: BugType;
  maxCount: number;
}

export type StructureOperationalResourceRequirement =
  | StructureOperationalItemRequirement
  | StructureOperationalBugRequirement;

export type StructureOperationalOutputType = ItemType | BugType;

export type StructureOperationalResourceOutputs = Partial<
  Record<StructureOperationalOutputType, StructureOperationalResourceRequirement>
>;

export type StructureOperationalResourceRequirementsByLevel = Record<
  number,
  StructureOperationalResourceOutputs
>;

export const STRUCTURE_OPERATIONAL_RESOURCE_REQUIREMENTS: Partial<
  Record<StructureType, StructureOperationalResourceRequirementsByLevel>
> = {
  stonemason: {
    0: {
      brick: { itemType: "little_rock", maxCount: 3 },
    },
    1: {
      paving_stone: { itemType: "brick", maxCount: 1 },
    },
    2: {
      sculpture: { itemType: "paving_stone", maxCount: 1 },
    },
  },
  woodcutter: {
    0: {
      wood: { itemType: "stick", maxCount: 3 },
    },
    1: {
      plank: { itemType: "wood", maxCount: 1 },
    },
    2: {
      furniture: { itemType: "plank", maxCount: 1 },
    },
  },
  kitchen: {
    0: {
      nettle_soup: { itemType: "leaf_part", maxCount: 2 },
      grilled_greenflies: { bugType: "greenfly", maxCount: 3 },
      stuffed_fly: { bugType: "fly", maxCount: 1 },
    },
    1: {
      pasta: { itemType: "mushroom", maxCount: 2 },
    },
  },
  tavern: {
    0: {
      ant: { itemType: "nettle_soup", maxCount: 2 },
      ladybug: { itemType: "grilled_greenflies", maxCount: 1 },
      termite: { itemType: "pasta", maxCount: 2 },
      spider: { itemType: "stuffed_fly", maxCount: 2 },
    },
  },
  smelter: {
    0: {
      iron_ingot: { itemType: "iron_ore", maxCount: 3 },
      roof_tile: { itemType: "clay", maxCount: 2 },
    },
    1: {
      concrete: { itemType: "gravel", maxCount: 1 },
      steel: { itemType: "iron_ingot", maxCount: 1 },
    },
  },
  mushrooms_field: {
    0: {
      mushroom: { itemType: "paper", maxCount: 2 },
    },
  },
  composter: {
    0: {
      fly: { itemType: "rotten_apple", maxCount: 2 },
    },
  },
  flowers_field: {
    0: {
      flower: { itemType: "seeds", maxCount: 2 },
    },
  },
  library: {
    0: {
      book: { itemType: "paper", maxCount: 1 },
    },
  },
  town_hall: {
    0: {
      bee: { itemType: "flower", maxCount: 3 },
    },
  },
};
