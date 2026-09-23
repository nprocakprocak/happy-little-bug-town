import { describe, expect, it } from "vitest";
import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import {
  canDropFoodOnBug,
  getBugFoodCount,
  getBugFoodRequirement,
  isBugFed,
  isFoodForBug,
} from "./feeding.js";

interface FedBug {
  bugType: BugType;
  items: { itemType: ItemType }[];
}

describe("bug feeding", () => {
  it("returns the food requirement for each bug", () => {
    expect(getBugFoodRequirement("beetle")).toEqual({
      itemType: "leaf_part",
      maxCount: 2,
    });
    expect(getBugFoodRequirement("bee")).toEqual({
      itemType: "flower",
      maxCount: 3,
    });
    expect(getBugFoodRequirement("ladybug")?.itemType).toBe("grilled_greenflies");
    expect(getBugFoodRequirement("termite")?.maxCount).toBe(1);
  });

  it("counts only the food that bug eats", () => {
    const bug: FedBug = {
      bugType: "beetle",
      items: [{ itemType: "leaf_part" }, { itemType: "stick" }],
    };

    expect(getBugFoodCount(bug)).toBe(1);
    expect(isBugFed(bug)).toBe(false);
  });

  it("treats a bug as fed once it holds enough of its food", () => {
    const bug: FedBug = {
      bugType: "ant",
      items: [{ itemType: "nettle_soup" }, { itemType: "nettle_soup" }],
    };

    expect(getBugFoodCount(bug)).toBe(2);
    expect(isBugFed(bug)).toBe(true);
  });

  it("accepts more food until the bug is full", () => {
    const bug: FedBug = {
      bugType: "fly",
      items: [{ itemType: "rotten_apple" }],
    };

    expect(isFoodForBug("rotten_apple", bug)).toBe(true);
    expect(isFoodForBug("flower", bug)).toBe(false);
    expect(canDropFoodOnBug("rotten_apple", bug)).toBe(true);
    expect(canDropFoodOnBug("leaf_part", bug)).toBe(false);

    bug.items.push({ itemType: "rotten_apple" });
    expect(canDropFoodOnBug("rotten_apple", bug)).toBe(false);
  });
});
