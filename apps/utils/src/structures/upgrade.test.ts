import { describe, expect, it } from "vitest";
import { WORKSHOP_LVL_2_BUILD_COSTS } from "../constants/structureUpgradeCosts.js";
import { ItemType } from "../types/itemType.js";
import {
  canAcceptItemForUpgrade,
  canStartStructureUpgrade,
  canStartStructureUpgradeToLevel,
  getCompletedUpgradeLevel,
  getCurrentOrNextUpgradeLevel,
  getNextStructureUpgradeLevel,
  getReservedItemCountForOperationalResources,
  getStructureUpgradeLevels,
  getStructureUpgradeProgress,
  getUpgradeResourceCosts,
  getUpgradeResourceCostsForType,
  isStructureUpgradeIncomplete,
  StructureForUpgrade,
} from "./upgrade.js";

function copies(itemType: ItemType, count: number): { itemType: ItemType }[] {
  return Array.from({ length: count }, () => ({ itemType }));
}

function workshop(upgradeLevel: number, extra: ItemType[]): StructureForUpgrade {
  return {
    structureType: "workshop",
    upgradeLevel,
    items: [
      ...copies("leaf_part", 3),
      ...copies("little_rock", 2),
      ...copies("stick", 1),
      ...copies("root", 1),
      ...extra.map((itemType) => ({ itemType })),
    ],
  };
}

const levelTwoMaterials: ItemType[] = ["wood", "brick", "iron_ingot", "glass"];
const levelThreeMaterials: ItemType[] = ["concrete", "steel", "glass", "furniture"];

describe("structure upgrade", () => {
  it("returns the cost of the requested level and falls back for a direct lookup", () => {
    expect(getUpgradeResourceCosts("workshop", 1)).toEqual(WORKSHOP_LVL_2_BUILD_COSTS);
    expect(getUpgradeResourceCosts("tavern", 1)).toEqual([]);
    expect(getUpgradeResourceCostsForType("workshop", 9)).toEqual(WORKSHOP_LVL_2_BUILD_COSTS);
    expect(getStructureUpgradeLevels("workshop")).toEqual([1, 2]);
    expect(getStructureUpgradeLevels("kitchen")).toEqual([1]);
  });

  it("starts the next upgrade only from a finished level that has a recipe", () => {
    const built = workshop(0, []);
    const upgrading = workshop(1, []);
    const levelTwo = workshop(1, levelTwoMaterials);
    const maxed = workshop(2, [...levelTwoMaterials, ...levelThreeMaterials]);

    expect(canStartStructureUpgrade(built)).toBe(true);
    expect(canStartStructureUpgradeToLevel(built, 1)).toBe(true);
    expect(canStartStructureUpgradeToLevel(built, 2)).toBe(false);
    expect(canStartStructureUpgrade(upgrading)).toBe(false);
    expect(canStartStructureUpgrade(levelTwo)).toBe(true);
    expect(canStartStructureUpgradeToLevel(levelTwo, 2)).toBe(true);
    expect(canStartStructureUpgrade(maxed)).toBe(false);
    expect(canStartStructureUpgrade({ structureType: "beetle_house", upgradeLevel: 0, items: [] })).toBe(
      false,
    );
  });

  it("tracks the in-progress level separately from the last completed level", () => {
    const built = workshop(0, []);
    const upgrading = workshop(1, []);
    const levelTwo = workshop(1, levelTwoMaterials);

    expect(getNextStructureUpgradeLevel(built)).toBe(1);
    expect(getCurrentOrNextUpgradeLevel(built)).toBe(1);
    expect(getCompletedUpgradeLevel(built)).toBe(0);
    expect(isStructureUpgradeIncomplete(upgrading)).toBe(true);
    expect(getCurrentOrNextUpgradeLevel(upgrading)).toBe(1);
    expect(getCompletedUpgradeLevel(upgrading)).toBe(0);
    expect(isStructureUpgradeIncomplete(levelTwo)).toBe(false);
    expect(getCompletedUpgradeLevel(levelTwo)).toBe(1);
    expect(getCurrentOrNextUpgradeLevel(levelTwo)).toBe(2);
  });

  it("ignores materials already spent on the build when measuring upgrade progress", () => {
    const stonemason: StructureForUpgrade = {
      structureType: "stonemason",
      upgradeLevel: 1,
      items: [
        ...copies("leaf_part", 2),
        ...copies("little_rock", 2),
        ...copies("root", 1),
        ...copies("wood", 1),
      ],
    };
    const withUpgradeWood: StructureForUpgrade = {
      ...stonemason,
      items: [...stonemason.items, ...copies("wood", 1)],
    };

    expect(getStructureUpgradeProgress(stonemason).find((progress) => progress.itemType === "wood")).toEqual({
      itemType: "wood",
      supplied: 0,
      required: 1,
      missing: 1,
    });
    expect(getStructureUpgradeProgress(withUpgradeWood).find((progress) => progress.itemType === "wood")?.missing).toBe(
      0,
    );
    expect(canAcceptItemForUpgrade(stonemason, "wood")).toBe(true);
    expect(canAcceptItemForUpgrade(stonemason, "leaf_part")).toBe(false);
    expect(canAcceptItemForUpgrade(workshop(0, []), "wood")).toBe(false);
    expect(canAcceptItemForUpgrade({ ...workshop(1, []), items: [] }, "wood")).toBe(false);
  });

  it("reserves build and earlier upgrade materials from operational use", () => {
    expect(getReservedItemCountForOperationalResources(workshop(0, []), "wood")).toBe(0);
    expect(getReservedItemCountForOperationalResources(workshop(1, levelTwoMaterials), "wood")).toBe(1);
    expect(getReservedItemCountForOperationalResources(workshop(1, []), "leaf_part")).toBe(3);
  });
});
