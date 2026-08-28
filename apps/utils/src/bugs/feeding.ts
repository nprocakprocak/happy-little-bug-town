import {
  ANT_MAX_NETTLE_SOUP,
  BEE_MAX_FLOWERS,
  BEETLE_MAX_LEAF_PARTS,
  FLY_MAX_ROTTEN_APPLES,
  GREENFLY_MAX_LEAF_PARTS,
  LADYBUG_MAX_GRILLED_GREENFLIES,
  SPIDER_MAX_STUFFED_FLIES,
  TERMITE_MAX_PASTA,
} from "../constants/game.js";
import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";

export interface BugFoodRequirement {
  itemType: ItemType;
  maxCount: number;
}

interface BugForFeeding {
  bugType: BugType;
  items: { itemType: ItemType }[];
}

const BUG_FOOD_REQUIREMENTS: Partial<Record<BugType, BugFoodRequirement>> = {
  beetle: { itemType: "leaf_part", maxCount: BEETLE_MAX_LEAF_PARTS },
  greenfly: { itemType: "leaf_part", maxCount: GREENFLY_MAX_LEAF_PARTS },
  ladybug: {
    itemType: "grilled_greenflies",
    maxCount: LADYBUG_MAX_GRILLED_GREENFLIES,
  },
  ant: { itemType: "nettle_soup", maxCount: ANT_MAX_NETTLE_SOUP },
  termite: { itemType: "pasta", maxCount: TERMITE_MAX_PASTA },
  spider: { itemType: "stuffed_fly", maxCount: SPIDER_MAX_STUFFED_FLIES },
  fly: { itemType: "rotten_apple", maxCount: FLY_MAX_ROTTEN_APPLES },
  bee: { itemType: "flower", maxCount: BEE_MAX_FLOWERS },
};

export function getBugFoodRequirement(
  bugType: BugType,
): BugFoodRequirement | undefined {
  return BUG_FOOD_REQUIREMENTS[bugType];
}

export function getBugFoodCount(bug: BugForFeeding): number {
  const requirement = getBugFoodRequirement(bug.bugType);
  if (!requirement) {
    return 0;
  }

  return bug.items.filter((item) => item.itemType === requirement.itemType)
    .length;
}

export function isBugFed(bug: BugForFeeding): boolean {
  const requirement = getBugFoodRequirement(bug.bugType);
  if (!requirement) {
    return false;
  }

  return getBugFoodCount(bug) >= requirement.maxCount;
}

export function isFoodForBug(
  itemType: ItemType,
  bug: Pick<BugForFeeding, "bugType">,
): boolean {
  return getBugFoodRequirement(bug.bugType)?.itemType === itemType;
}

export function canDropFoodOnBug(
  itemType: ItemType,
  bug: BugForFeeding,
): boolean {
  const requirement = getBugFoodRequirement(bug.bugType);
  if (!requirement || itemType !== requirement.itemType) {
    return false;
  }

  return getBugFoodCount(bug) < requirement.maxCount;
}
