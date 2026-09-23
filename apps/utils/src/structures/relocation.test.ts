import { describe, expect, it } from "vitest";
import { ItemForCraft } from "../items/craft.js";
import { ItemType } from "../types/itemType.js";
import { StructureForBuild } from "./build.js";
import { canRelocateStructure } from "./relocation.js";

function copies(itemType: ItemType, count: number): { itemType: ItemType }[] {
  return Array.from({ length: count }, () => ({ itemType }));
}

function hammer(ingredients: ItemType[]): ItemForCraft {
  return { itemType: "hammer", items: ingredients.map((itemType) => ({ itemType })) };
}

describe("structure relocation", () => {
  const incompleteWorkshop: StructureForBuild = { structureType: "workshop", items: [] };
  const builtWorkshop: StructureForBuild = {
    structureType: "workshop",
    items: [
      ...copies("leaf_part", 3),
      ...copies("little_rock", 2),
      ...copies("stick", 1),
      ...copies("root", 1),
    ],
  };
  const hole: StructureForBuild = { structureType: "hole", items: [] };
  const craftedHammer = hammer(["brick", "wood", "root", "root"]);

  it("moves an unfinished structure without a hammer", () => {
    expect(canRelocateStructure(incompleteWorkshop, [])).toBe(true);
  });

  it("moves a finished structure only with a crafted hammer", () => {
    expect(canRelocateStructure(builtWorkshop, [])).toBe(false);
    expect(canRelocateStructure(builtWorkshop, [hammer([])])).toBe(false);
    expect(canRelocateStructure(builtWorkshop, [craftedHammer])).toBe(true);
  });

  it("never moves ground", () => {
    expect(canRelocateStructure(hole, [])).toBe(false);
    expect(canRelocateStructure(hole, [craftedHammer])).toBe(false);
  });
});
