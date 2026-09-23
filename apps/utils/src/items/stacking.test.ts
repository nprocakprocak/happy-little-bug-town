import { describe, expect, it } from "vitest";
import { ItemType } from "../types/itemType.js";
import { ItemForCraft } from "./craft.js";
import { canStackItemType, hasCraftedItem } from "./stacking.js";

function crafted(itemType: ItemType, ingredients: ItemType[]): ItemForCraft {
  return {
    itemType,
    items: ingredients.map((ingredient) => ({ itemType: ingredient })),
  };
}

describe("item stacking", () => {
  const leafRake = crafted("leaf_rake", [
    "leaf_part",
    "leaf_part",
    "leaf_part",
    "brick",
    "wood",
    "root",
    "root",
  ]);
  const unfinishedLeafRake = crafted("leaf_rake", []);
  const wheelbarrel = crafted("wheelbarrel", ["wood", "wood", "iron_ingot"]);
  const basket = crafted("basket", ["iron_ingot", "steel"]);

  it("recognises a finished tool and ignores an unfinished one", () => {
    expect(hasCraftedItem([leafRake], "leaf_rake")).toBe(true);
    expect(hasCraftedItem([unfinishedLeafRake], "leaf_rake")).toBe(false);
    expect(hasCraftedItem([leafRake], "basket")).toBe(false);
  });

  it("allows stacking only when the matching tool is crafted", () => {
    expect(canStackItemType("leaf_part", [leafRake])).toBe(true);
    expect(canStackItemType("stick", [leafRake])).toBe(true);
    expect(canStackItemType("root", [unfinishedLeafRake])).toBe(false);
    expect(canStackItemType("little_rock", [wheelbarrel])).toBe(true);
    expect(canStackItemType("gravel", [leafRake])).toBe(false);
    expect(canStackItemType("rotten_apple", [basket])).toBe(true);
    expect(canStackItemType("paper", [])).toBe(false);
    expect(canStackItemType("axe", [leafRake, wheelbarrel, basket])).toBe(false);
  });
});
