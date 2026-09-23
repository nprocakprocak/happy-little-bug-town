import { describe, expect, it } from "vitest";
import { ItemForCraft } from "../items/craft.js";
import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import {
  canDiscardBugOnStructure,
  canDiscardItemOnStructure,
  canDropItemOnStructure,
  canStructureAcceptDroppedBug,
  droppedBugMustBeFed,
} from "./itemDrop.js";

interface DropStructure {
  structureType: StructureType;
  upgradeLevel: number;
  bugs: { bugType: BugType }[];
  items: { itemType: ItemType }[];
}

function copies(itemType: ItemType, count: number): { itemType: ItemType }[] {
  return Array.from({ length: count }, () => ({ itemType }));
}

function looseItem(itemType: ItemType): ItemForCraft {
  return { itemType, items: [] };
}

function axe(ingredients: ItemType[]): ItemForCraft {
  return {
    itemType: "axe",
    items: ingredients.map((itemType) => ({ itemType })),
  };
}

describe("dropping onto structures", () => {
  const incompleteWorkshop: DropStructure = {
    structureType: "workshop",
    upgradeLevel: 0,
    bugs: [],
    items: copies("leaf_part", 1),
  };
  const builtWorkshop: DropStructure = {
    structureType: "workshop",
    upgradeLevel: 0,
    bugs: [],
    items: [...copies("leaf_part", 3), ...copies("little_rock", 2), ...copies("stick", 1), ...copies("root", 1)],
  };
  const hole: DropStructure = {
    structureType: "hole",
    upgradeLevel: 0,
    bugs: [],
    items: [],
  };
  const beetleHouse: DropStructure = {
    structureType: "beetle_house",
    upgradeLevel: 0,
    bugs: [],
    items: [...copies("leaf_part", 2), ...copies("little_rock", 1), ...copies("stick", 2)],
  };
  const woodcutter: DropStructure = {
    structureType: "woodcutter",
    upgradeLevel: 0,
    bugs: [],
    items: [
      ...copies("leaf_part", 3),
      ...copies("root", 1),
      ...copies("stick", 2),
      ...copies("little_rock", 1),
    ],
  };
  const poweredKitchen: DropStructure = {
    structureType: "kitchen",
    upgradeLevel: 0,
    bugs: [{ bugType: "beetle" }],
    items: [
      ...copies("leaf_part", 2),
      ...copies("brick", 1),
      ...copies("wood", 2),
      ...copies("knife", 2),
    ],
  };

  it("discards items only on ground that will not keep them", () => {
    expect(canDiscardItemOnStructure(hole)).toBe(true);
    expect(canDiscardItemOnStructure(incompleteWorkshop)).toBe(false);
  });

  it("discards a bug on ground when the structure will not take it", () => {
    expect(canDiscardBugOnStructure({ bugType: "beetle" }, hole)).toBe(true);
    expect(canDiscardBugOnStructure({ bugType: "ant" }, hole)).toBe(false);
    expect(canDiscardBugOnStructure({ bugType: "beetle" }, builtWorkshop)).toBe(false);
  });

  it("requires a fed bug for power and operational drops, not for houses", () => {
    expect(droppedBugMustBeFed({ bugType: "beetle" }, builtWorkshop)).toBe(true);
    expect(droppedBugMustBeFed({ bugType: "beetle" }, incompleteWorkshop)).toBe(false);
    expect(droppedBugMustBeFed({ bugType: "beetle" }, beetleHouse)).toBe(false);
    expect(droppedBugMustBeFed({ bugType: "greenfly" }, poweredKitchen)).toBe(true);
    expect(canStructureAcceptDroppedBug({ bugType: "greenfly" }, poweredKitchen)).toBe(true);
    expect(canStructureAcceptDroppedBug({ bugType: "ant" }, poweredKitchen)).toBe(false);
  });

  it("accepts build materials, crafted power items, and operational resources", () => {
    expect(canDropItemOnStructure(looseItem("leaf_part"), incompleteWorkshop)).toBe(true);
    expect(canDropItemOnStructure(looseItem("wood"), incompleteWorkshop)).toBe(false);
    expect(canDropItemOnStructure(looseItem("leaf_part"), hole)).toBe(false);
    expect(canDropItemOnStructure(axe(["little_rock", "stick", "root"]), woodcutter)).toBe(true);
    expect(canDropItemOnStructure(axe([]), woodcutter)).toBe(false);
    expect(canDropItemOnStructure(looseItem("leaf_part"), poweredKitchen)).toBe(true);
    expect(canDropItemOnStructure(looseItem("leaf_part"), { ...poweredKitchen, bugs: [] })).toBe(
      false,
    );
  });
});
