import { describe, expect, it } from "vitest";
import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import {
  canAcceptOperationalBugForStructure,
  canAcceptOperationalResourceForStructure,
  canCraftFromStructureOperationalResources,
  getCraftableOperationalResourceOutput,
  getCraftableOperationalResourceOutputs,
  getStructureOperationalResourceBugs,
  getStructureOperationalResourceItems,
  getStructureOperationalResourceOutputs,
  getStructureOperationalResourceProgresses,
  getVisibleStructureOperationalResourceProgresses,
  hasStructureOperationalResources,
  isOperationalBugRequirement,
  isOperationalItemRequirement,
  StructureOperationalResourceProgress,
} from "./structureOperationalResources.js";

interface ResourceStructure {
  structureType: StructureType;
  upgradeLevel: number;
  bugs: { id: string; bugType: BugType }[];
  items: { id: string; itemType: ItemType }[];
}

function copies(
  itemType: ItemType,
  count: number,
  idPrefix: string,
): { id: string; itemType: ItemType }[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${idPrefix}-${index}`,
    itemType,
  }));
}

function kitchen(extraLeaves: number, bugs: { id: string; bugType: BugType }[]): ResourceStructure {
  return {
    structureType: "kitchen",
    upgradeLevel: 0,
    bugs,
    items: [
      ...copies("leaf_part", 2 + extraLeaves, "leaf"),
      ...copies("brick", 1, "brick"),
      ...copies("wood", 2, "wood"),
      ...copies("knife", 2, "knife"),
    ],
  };
}

function progressAt(structure: ResourceStructure, index: number): StructureOperationalResourceProgress {
  const progress = getStructureOperationalResourceProgresses(structure)[index];
  if (!progress) {
    throw new Error(`Missing operational progress at index ${index}`);
  }
  return progress;
}

describe("structure operational resources", () => {
  const beetle: { id: string; bugType: BugType } = { id: "beetle-1", bugType: "beetle" };
  const greenflies: { id: string; bugType: BugType }[] = [
    { id: "greenfly-1", bugType: "greenfly" },
    { id: "greenfly-2", bugType: "greenfly" },
  ];
  const poweredKitchen = kitchen(1, [beetle, ...greenflies]);

  it("distinguishes item and bug requirements", () => {
    const nettle = progressAt(poweredKitchen, 0);
    const grilled = progressAt(poweredKitchen, 1);

    expect(isOperationalItemRequirement(nettle.requirement)).toBe(true);
    expect(isOperationalBugRequirement(nettle.requirement)).toBe(false);
    expect(isOperationalBugRequirement(grilled.requirement)).toBe(true);
  });

  it("hides empty outputs and keeps supplied resources above the reserved build cost", () => {
    const hole: ResourceStructure = { ...poweredKitchen, structureType: "hole" };

    expect(getStructureOperationalResourceOutputs(hole)).toBeUndefined();
    expect(getVisibleStructureOperationalResourceProgresses(kitchen(0, [beetle]))).toEqual([]);
    expect(hasStructureOperationalResources(kitchen(0, [beetle]))).toBe(false);

    const visible = getVisibleStructureOperationalResourceProgresses(poweredKitchen);
    expect(visible.map((progress) => progress.outputType)).toEqual([
      "nettle_soup",
      "grilled_greenflies",
    ]);
    expect(visible.map((progress) => progress.count)).toEqual([1, 2]);
    expect(hasStructureOperationalResources(poweredKitchen)).toBe(true);
  });

  it("returns operational items and bugs after reserved build and power costs", () => {
    const leafRequirement = progressAt(poweredKitchen, 0).requirement;
    const greenflyRequirement = progressAt(poweredKitchen, 1).requirement;

    expect(getStructureOperationalResourceItems(poweredKitchen, leafRequirement).map((item) => item.id)).toEqual([
      "leaf-2",
    ]);
    expect(
      getStructureOperationalResourceBugs(poweredKitchen, greenflyRequirement).map((occupant) => occupant.id),
    ).toEqual(["greenfly-1", "greenfly-2"]);
    expect(getStructureOperationalResourceItems(poweredKitchen, greenflyRequirement)).toEqual([]);
    expect(
      getStructureOperationalResourceBugs(poweredKitchen, { bugType: "beetle", maxCount: 1 }),
    ).toEqual([]);
    expect(
      getStructureOperationalResourceItems({ ...poweredKitchen, items: [] }, leafRequirement),
    ).toEqual([]);
  });

  it("accepts resources only while the structure is built, powered, and below the cap", () => {
    expect(canAcceptOperationalResourceForStructure(poweredKitchen, "leaf_part")).toBe(true);
    expect(canAcceptOperationalBugForStructure(poweredKitchen, "fly")).toBe(true);
    expect(canAcceptOperationalBugForStructure(poweredKitchen, "greenfly")).toBe(false);
    expect(canAcceptOperationalResourceForStructure(poweredKitchen, "stick")).toBe(false);
    expect(canAcceptOperationalResourceForStructure(kitchen(1, []), "leaf_part")).toBe(false);
    expect(
      canAcceptOperationalResourceForStructure({ ...poweredKitchen, items: [] }, "leaf_part"),
    ).toBe(false);
  });

  it("crafts an output once its resource count reaches the maximum", () => {
    expect(getCraftableOperationalResourceOutput(poweredKitchen)?.outputType).toBe("grilled_greenflies");
    expect(getCraftableOperationalResourceOutputs(poweredKitchen)).toHaveLength(1);
    expect(canCraftFromStructureOperationalResources(poweredKitchen)).toBe(true);

    const ready = kitchen(2, [beetle, ...greenflies]);
    expect(getCraftableOperationalResourceOutput(ready)?.outputType).toBe("nettle_soup");
    expect(getCraftableOperationalResourceOutputs(ready)).toHaveLength(2);
    expect(getCraftableOperationalResourceOutput(kitchen(2, greenflies))).toBeUndefined();
    expect(canCraftFromStructureOperationalResources(kitchen(2, greenflies))).toBe(false);
  });

  it("merges outputs up to the operational upgrade level", () => {
    const baseItems = [
      ...copies("leaf_part", 2, "leaf"),
      ...copies("little_rock", 2, "rock"),
      ...copies("root", 1, "root"),
      ...copies("wood", 1, "build-wood"),
      ...copies("wood", 1, "upgrade-wood"),
      ...copies("brick", 1, "upgrade-brick"),
      ...copies("glass", 2, "glass"),
      ...copies("roof_tile", 1, "roof"),
      ...copies("hammer_and_chisel", 2, "hammer"),
      ...copies("little_rock", 2, "extra-rock"),
    ];
    const stonemason: ResourceStructure = {
      structureType: "stonemason",
      upgradeLevel: 1,
      bugs: [{ id: "beetle-1", bugType: "beetle" }],
      items: baseItems,
    };
    const upgraded: ResourceStructure = {
      ...stonemason,
      bugs: [{ id: "ladybug-1", bugType: "ladybug" }],
      items: [
        ...baseItems,
        ...copies("hammer_and_chisel", 1, "extra-hammer"),
        ...copies("brick", 1, "extra-brick"),
      ],
    };

    expect(
      getStructureOperationalResourceProgresses(stonemason).map((progress) => progress.outputType),
    ).toEqual(["brick"]);
    expect(
      getStructureOperationalResourceProgresses(upgraded).map((progress) => progress.outputType),
    ).toEqual(["brick", "paving_stone"]);
    expect(
      getCraftableOperationalResourceOutputs(upgraded).map((output) => output.outputType),
    ).toEqual(["brick", "paving_stone"]);
  });
});
