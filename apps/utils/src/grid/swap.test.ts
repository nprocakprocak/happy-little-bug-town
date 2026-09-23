import { describe, expect, it } from "vitest";
import { ItemType } from "../types/itemType.js";
import { Positionable } from "../types/positionable.js";
import { canSwapOnGrid } from "./swap.js";

function craftItem(
  itemType: ItemType,
  ingredients: ItemType[],
  position: { x: number; y: number },
) {
  return {
    ...position,
    itemType,
    items: ingredients.map((ingredient) => ({ itemType: ingredient })),
  };
}

describe("grid swap", () => {
  const bug: Positionable = { x: 3, y: 1, bugType: "ant" };
  const looseItem: Positionable = { x: 4, y: 1, itemType: "leaf_part" };
  const completeAxe = craftItem("axe", ["little_rock", "stick", "root"], { x: 1, y: 1 });
  const incompleteAxe = craftItem("axe", [], { x: 2, y: 1 });

  it("swaps single-cell bugs and finished items", () => {
    expect(canSwapOnGrid(bug, looseItem)).toBe(true);
    expect(canSwapOnGrid(completeAxe, bug)).toBe(true);
  });

  it("blocks structures, stacks, wide items, and unfinished craft items", () => {
    expect(canSwapOnGrid({ x: 1, y: 2, structureType: "workshop" }, bug)).toBe(false);
    expect(canSwapOnGrid({ x: 1, y: 3, itemsCount: 2 }, bug)).toBe(false);
    expect(canSwapOnGrid({ x: 1, y: 4, itemType: "hammer" }, bug)).toBe(false);
    expect(canSwapOnGrid(incompleteAxe, bug)).toBe(false);
    expect(canSwapOnGrid(bug, incompleteAxe)).toBe(false);
    expect(canSwapOnGrid(completeAxe, incompleteAxe)).toBe(false);
  });
});
