import { describe, expect, it } from "vitest";
import { ItemForCraft } from "../items/craft.js";
import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import {
  canDropBugOnStructure,
  canStructureAcceptBugDrop,
  canStructureAcceptItemPowerDrop,
  getOperationalUpgradeLevel,
  getStructureBugPowerMissing,
  getStructureBugPowerSuppliedCount,
  getStructureItemPowerMissing,
  getStructurePowerRequirement,
  hasStructureItemPowerRequirements,
  isStructureAwaitingPower,
  isStructureBugPowered,
  isStructureItemPowered,
  isStructureOperationallyPowered,
  isStructurePowered,
  pickMostFedBug,
  structureDropRequiresFedBug,
  structureRequiresPower,
  structureShowsActivationGlow,
} from "./power.js";

interface PowerStructure {
  structureType: StructureType;
  upgradeLevel: number;
  bugs: { bugType: BugType }[];
  items: { itemType: ItemType }[];
}

interface FedBug {
  bugType: BugType;
  items: { itemType: ItemType }[];
}

function copies(itemType: ItemType, count: number): { itemType: ItemType }[] {
  return Array.from({ length: count }, () => ({ itemType }));
}

function bug(bugType: BugType, food: ItemType, count: number): FedBug {
  return { bugType, items: copies(food, count) };
}

function workshop(items: { itemType: ItemType }[], bugs: { bugType: BugType }[]): PowerStructure {
  return { structureType: "workshop", upgradeLevel: 0, items, bugs };
}

const builtWorkshopItems = [
  ...copies("leaf_part", 3),
  ...copies("little_rock", 2),
  ...copies("stick", 1),
  ...copies("root", 1),
];

describe("structure power", () => {
  it("picks the bug holding the most items and keeps the first tie", () => {
    const bugs: FedBug[] = [
      bug("ant", "nettle_soup", 1),
      bug("beetle", "leaf_part", 2),
      bug("ladybug", "grilled_greenflies", 1),
    ];

    expect(pickMostFedBug(bugs)).toBe(bugs[1]);
    expect(pickMostFedBug([bugs[0], bugs[2]])).toBe(bugs[0]);
    expect(() => pickMostFedBug([])).toThrow("Cannot pick most fed bug from empty list");
  });

  it("reads power requirements and falls back to the base level", () => {
    expect(structureRequiresPower("workshop", 0)).toBe(true);
    expect(structureRequiresPower("hole", 0)).toBe(false);
    expect(structureDropRequiresFedBug("workshop", 0)).toBe(true);
    expect(structureDropRequiresFedBug("kitchen", 0)).toBe(true);
    expect(structureDropRequiresFedBug("hole", 0)).toBe(false);
    expect(getStructurePowerRequirement("workshop", 5)?.bugRequirements).toEqual(
      getStructurePowerRequirement("workshop", 0)?.bugRequirements,
    );
    expect(hasStructureItemPowerRequirements("woodcutter", 0)).toBe(true);
    expect(hasStructureItemPowerRequirements("workshop", 0)).toBe(false);
  });

  it("counts supplied bugs and items against the active level", () => {
    const structure = workshop(copies("axe", 1), [{ bugType: "beetle" }, { bugType: "ant" }]);

    expect(getStructureBugPowerSuppliedCount(structure, "beetle")).toBe(1);
    expect(getStructureBugPowerMissing(structure, "beetle")).toBe(0);
    expect(getStructureBugPowerMissing(structure, "ant")).toBe(0);
    expect(getStructureItemPowerMissing({ ...structure, structureType: "woodcutter" }, "axe")).toBe(
      1,
    );
  });

  it("accepts a fed power bug, an unfed house bug, and an evolution occupant", () => {
    const built = workshop(builtWorkshopItems, []);
    const unfinished = workshop([], []);
    const beetleHouse: PowerStructure = {
      structureType: "beetle_house",
      upgradeLevel: 0,
      bugs: [],
      items: [...copies("leaf_part", 2), ...copies("little_rock", 1), ...copies("stick", 2)],
    };
    const hole: PowerStructure = { structureType: "hole", upgradeLevel: 0, bugs: [], items: [] };

    expect(canStructureAcceptBugDrop(bug("beetle", "leaf_part", 2), built)).toBe(true);
    expect(canDropBugOnStructure(bug("beetle", "leaf_part", 2), built)).toBe(true);
    expect(canDropBugOnStructure(bug("beetle", "leaf_part", 1), built)).toBe(false);
    expect(canDropBugOnStructure(bug("ant", "nettle_soup", 2), built)).toBe(false);
    expect(canDropBugOnStructure(bug("beetle", "leaf_part", 2), unfinished)).toBe(false);
    expect(canDropBugOnStructure(bug("beetle", "leaf_part", 0), beetleHouse)).toBe(true);
    expect(canDropBugOnStructure(bug("ant", "nettle_soup", 2), beetleHouse)).toBe(false);
    expect(canDropBugOnStructure(bug("ant", "nettle_soup", 0), hole)).toBe(true);
    const fullHole: PowerStructure = {
      ...hole,
      bugs: [{ bugType: "ant" }, { bugType: "ant" }, { bugType: "ant" }],
    };

    expect(canDropBugOnStructure(bug("ant", "nettle_soup", 0), fullHole)).toBe(false);
  });

  it("accepts a crafted power item only while the structure still needs it", () => {
    const woodcutter: PowerStructure = {
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
    const craftedAxe: ItemForCraft = {
      itemType: "axe",
      items: [{ itemType: "little_rock" }, { itemType: "stick" }, { itemType: "root" }],
    };

    expect(canStructureAcceptItemPowerDrop(craftedAxe, woodcutter)).toBe(true);
    expect(canStructureAcceptItemPowerDrop({ itemType: "axe", items: [] }, woodcutter)).toBe(false);
    expect(
      canStructureAcceptItemPowerDrop(craftedAxe, {
        ...woodcutter,
        items: [...woodcutter.items, ...copies("axe", 2)],
      }),
    ).toBe(false);
    expect(
      canStructureAcceptItemPowerDrop(craftedAxe, { ...woodcutter, upgradeLevel: 1 }),
    ).toBe(false);
  });

  it("reports powered, awaiting, and glowing states from the completed upgrade level", () => {
    const unpowered = workshop(builtWorkshopItems, []);
    const powered = workshop(builtWorkshopItems, [{ bugType: "beetle" }]);
    const upgrading: PowerStructure = {
      ...powered,
      upgradeLevel: 1,
    };

    expect(isStructureBugPowered(unpowered)).toBe(false);
    expect(isStructureItemPowered(unpowered)).toBe(true);
    expect(isStructurePowered(unpowered)).toBe(false);
    expect(isStructureAwaitingPower(unpowered)).toBe(true);
    expect(structureShowsActivationGlow(unpowered)).toBe(true);
    expect(isStructurePowered(powered)).toBe(true);
    expect(isStructureAwaitingPower(powered)).toBe(false);
    expect(structureShowsActivationGlow(powered)).toBe(false);
    expect(isStructureBugPowered(upgrading)).toBe(true);
    expect(isStructurePowered(upgrading)).toBe(true);
    expect(getOperationalUpgradeLevel(upgrading)).toBe(0);
    expect(isStructureOperationallyPowered(upgrading)).toBe(true);
    expect(structureShowsActivationGlow(upgrading)).toBe(true);
    expect(isStructureAwaitingPower(workshop([], []))).toBe(false);
  });

  it("steps the operational level back when the completed upgrade is not powered", () => {
    const structure: PowerStructure = {
      structureType: "workshop",
      upgradeLevel: 1,
      bugs: [{ bugType: "beetle" }],
      items: [
        ...builtWorkshopItems,
        ...copies("wood", 1),
        ...copies("brick", 1),
        ...copies("iron_ingot", 1),
        ...copies("glass", 1),
      ],
    };

    expect(getOperationalUpgradeLevel(structure)).toBe(0);
    expect(isStructurePowered(structure)).toBe(false);
    expect(isStructureOperationallyPowered(structure)).toBe(true);
  });
});
