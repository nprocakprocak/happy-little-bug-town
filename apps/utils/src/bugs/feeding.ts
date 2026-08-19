import {
  ANT_MAX_NETTLE_SOUP,
  BEETLE_MAX_LEAF_PARTS,
  LADYBUG_MAX_GRILLED_GREENFLIES,
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
  ladybug: {
    itemType: "grilled_greenflies",
    maxCount: LADYBUG_MAX_GRILLED_GREENFLIES,
  },
  ant: { itemType: "nettle_soup", maxCount: ANT_MAX_NETTLE_SOUP },
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

export function canDropFoodOnBug(
  itemType: ItemType,
  bug: BugForFeeding,
): boolean {
  const requirement = getBugFoodRequirement(bug.bugType);
  if (!requirement) {
    return false;
  }

  return (
    itemType === requirement.itemType &&
    getBugFoodCount(bug) < requirement.maxCount
  );
}
