import { describe, expect, it } from "vitest";
import { ItemType } from "../types/itemType.js";
import {
  canCreateItemType,
  canCreateMultipleOfItemType,
  hasItemType,
  isWorkshopItemUnlocked,
} from "./availability.js";

describe("item availability", () => {
  const owned: { itemType: ItemType }[] = [{ itemType: "hammer" }, { itemType: "axe" }];

  it("allows multiples only for craftable items that are not unique tools", () => {
    expect(canCreateMultipleOfItemType("axe")).toBe(true);
    expect(canCreateMultipleOfItemType("hoe")).toBe(true);
    expect(canCreateMultipleOfItemType("hammer")).toBe(false);
    expect(canCreateMultipleOfItemType("leaf_rake")).toBe(false);
    expect(canCreateMultipleOfItemType("wheelbarrel")).toBe(false);
    expect(canCreateMultipleOfItemType("basket")).toBe(false);
    expect(canCreateMultipleOfItemType("leaf_part")).toBe(false);
  });

  it("detects an owned item type", () => {
    expect(hasItemType(owned, "axe")).toBe(true);
    expect(hasItemType(owned, "desk")).toBe(false);
  });

  it("unlocks workshop recipes by upgrade level", () => {
    expect(isWorkshopItemUnlocked("axe", 0)).toBe(true);
    expect(isWorkshopItemUnlocked("hoe", 0)).toBe(false);
    expect(isWorkshopItemUnlocked("hoe", 1)).toBe(true);
    expect(isWorkshopItemUnlocked("desk", 1)).toBe(false);
    expect(isWorkshopItemUnlocked("fountain", 2)).toBe(true);
    expect(isWorkshopItemUnlocked("stick", 2)).toBe(false);
  });

  it("blocks a second copy of a unique craftable item", () => {
    expect(canCreateItemType(owned, "axe")).toBe(true);
    expect(canCreateItemType(owned, "hammer")).toBe(false);
    expect(canCreateItemType([], "hammer")).toBe(true);
    expect(canCreateItemType([], "wood")).toBe(false);
  });
});
