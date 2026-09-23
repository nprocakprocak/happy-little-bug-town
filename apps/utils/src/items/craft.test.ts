import { describe, expect, it } from "vitest";
import { ItemType } from "../types/itemType.js";
import {
  canAcceptItemForItemCraft,
  canDropItemOnItem,
  getActiveItemCraftResource,
  getItemCraftProgress,
  getVisibleItemCraftProgress,
  isItemCrafted,
  isItemIncomplete,
  itemShowsActivationGlow,
  ItemForCraft,
} from "./craft.js";

function item(itemType: ItemType, ingredients: ItemType[]): ItemForCraft {
  return {
    itemType,
    items: ingredients.map((ingredient) => ({ itemType: ingredient })),
  };
}

describe("item craft", () => {
  it("tracks supplied, required, and missing ingredients in recipe order", () => {
    const axe = item("axe", ["little_rock"]);

    expect(getItemCraftProgress(axe)).toEqual([
      { itemType: "little_rock", supplied: 1, required: 1, missing: 0 },
      { itemType: "stick", supplied: 0, required: 1, missing: 1 },
      { itemType: "root", supplied: 0, required: 1, missing: 1 },
    ]);
    expect(getActiveItemCraftResource(axe)?.itemType).toBe("stick");
    expect(isItemCrafted(axe)).toBe(false);
    expect(isItemIncomplete(axe)).toBe(true);
  });

  it("treats an item with no recipe as already crafted", () => {
    const stick = item("stick", []);

    expect(isItemCrafted(stick)).toBe(true);
    expect(getItemCraftProgress(stick)).toEqual([]);
    expect(getActiveItemCraftResource(stick)).toBeUndefined();
    expect(itemShowsActivationGlow(stick)).toBe(false);
  });

  it("shows only the active ingredient for a single-cell recipe", () => {
    const axe = item("axe", ["little_rock"]);

    expect(getVisibleItemCraftProgress(axe)).toEqual([
      { itemType: "stick", supplied: 0, required: 1, missing: 1 },
    ]);
    expect(getVisibleItemCraftProgress(item("axe", ["little_rock", "stick", "root"]))).toEqual([]);
  });

  it("shows every ingredient for a wide recipe", () => {
    const leafRake = item("leaf_rake", []);

    expect(getVisibleItemCraftProgress(leafRake)).toHaveLength(4);
    expect(itemShowsActivationGlow(leafRake)).toBe(true);
  });

  it("accepts the active ingredient on a single-cell item and any missing one on a wide item", () => {
    const axe = item("axe", []);
    const leafRake = item("leaf_rake", ["leaf_part", "leaf_part", "leaf_part"]);

    expect(canAcceptItemForItemCraft(axe, "little_rock")).toBe(true);
    expect(canAcceptItemForItemCraft(axe, "root")).toBe(false);
    expect(canAcceptItemForItemCraft(leafRake, "brick")).toBe(true);
    expect(canAcceptItemForItemCraft(leafRake, "leaf_part")).toBe(false);
    expect(canAcceptItemForItemCraft(item("axe", ["little_rock", "stick", "root"]), "stick")).toBe(
      false,
    );
  });

  it("drops a finished item onto an unfinished item that still needs it", () => {
    const source = item("little_rock", []);
    const target = item("axe", []);
    const unfinishedSource = item("axe", ["little_rock"]);

    expect(canDropItemOnItem(source, target)).toBe(true);
    expect(canDropItemOnItem(unfinishedSource, target)).toBe(false);
    expect(canDropItemOnItem(item("stick", []), target)).toBe(false);
  });
});
