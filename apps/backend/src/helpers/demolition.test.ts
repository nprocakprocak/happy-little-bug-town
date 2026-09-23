import { describe, expect, it } from "vitest";

import { BugType, ItemType, StructureType } from "@happy-little-bug-town/utils";

import { getDemolishResultingUpgradeLevel, getNextDemolishTarget } from "./demolition.js";

interface DemolishItem {
  id: string;
  itemType: ItemType;
}

interface DemolishBug {
  id: string;
  bugType: BugType;
}

function item(id: string, itemType: ItemType): DemolishItem {
  return { id, itemType };
}

function bug(id: string, bugType: BugType): DemolishBug {
  return { id, bugType };
}

function copies(itemType: ItemType, count: number, idPrefix: string): DemolishItem[] {
  return Array.from({ length: count }, (_, index) => item(`${idPrefix}-${index}`, itemType));
}

function structure(
  structureType: StructureType,
  upgradeLevel: number,
  items: DemolishItem[],
  bugs: DemolishBug[],
) {
  return { structureType, upgradeLevel, items, bugs };
}

function workshopBuildItems(): DemolishItem[] {
  return [
    ...copies("leaf_part", 3, "leaf"),
    ...copies("little_rock", 2, "rock"),
    ...copies("stick", 1, "stick"),
    ...copies("root", 1, "root"),
  ];
}

function kitchenBuildItems(): DemolishItem[] {
  return [
    ...copies("leaf_part", 2, "leaf"),
    ...copies("brick", 1, "brick"),
    ...copies("wood", 2, "wood"),
  ];
}

describe("getNextDemolishTarget", () => {
  it("removes craft ingredients before automation, power, and the structure itself", () => {
    const kitchen = structure(
      "kitchen",
      0,
      [
        ...kitchenBuildItems(),
        ...copies("knife", 2, "knife"),
        item("leaf-extra-1", "leaf_part"),
        item("leaf-extra-2", "leaf_part"),
        item("mushroom-1", "mushroom"),
      ],
      [bug("beetle-1", "beetle"), bug("greenfly-1", "greenfly"), bug("termite-1", "termite")],
    );

    expect(getNextDemolishTarget(kitchen)).toEqual({ kind: "item", id: "leaf-extra-2" });
    expect(
      getNextDemolishTarget({
        ...kitchen,
        items: [...kitchenBuildItems(), ...copies("knife", 2, "knife")],
      }),
    ).toEqual({ kind: "bug", id: "greenfly-1" });
    expect(
      getNextDemolishTarget({
        ...kitchen,
        items: [...kitchenBuildItems(), ...copies("knife", 2, "knife")],
        bugs: [bug("beetle-1", "beetle"), bug("termite-1", "termite"), bug("ant-1", "ant")],
      }),
    ).toEqual({ kind: "bug", id: "termite-1" });
    expect(
      getNextDemolishTarget({
        ...kitchen,
        items: [...kitchenBuildItems(), ...copies("knife", 2, "knife")],
        bugs: [bug("beetle-1", "beetle"), bug("ant-1", "ant"), bug("ant-2", "ant")],
      }),
    ).toEqual({ kind: "bug", id: "ant-1" });
  });

  it("removes the highest upgrade's power bug before lower build materials", () => {
    const stonemason = structure(
      "stonemason",
      1,
      [
        ...copies("leaf_part", 2, "leaf"),
        ...copies("little_rock", 2, "rock"),
        ...copies("root", 1, "root"),
        ...copies("wood", 2, "wood"),
        ...copies("brick", 1, "brick"),
        ...copies("glass", 2, "glass"),
        ...copies("roof_tile", 1, "roof"),
        ...copies("hammer_and_chisel", 3, "hammer"),
      ],
      [bug("beetle-1", "beetle"), bug("ladybug-1", "ladybug")],
    );

    expect(getNextDemolishTarget(stonemason)).toEqual({ kind: "bug", id: "ladybug-1" });
    expect(
      getNextDemolishTarget({
        ...stonemason,
        bugs: [bug("beetle-1", "beetle")],
      }),
    ).toEqual({ kind: "item", id: "hammer-2" });
  });

  it("falls through build materials, leftover bugs, leftover items, then the structure", () => {
    expect(getNextDemolishTarget(structure("workshop", 0, workshopBuildItems(), []))).toEqual({
      kind: "item",
      id: "root-0",
    });
    expect(
      getNextDemolishTarget(
        structure(
          "workshop",
          0,
          [...workshopBuildItems(), item("wood-1", "wood")],
          [bug("beetle-1", "beetle")],
        ),
      ),
    ).toEqual({ kind: "bug", id: "beetle-1" });
    expect(
      getNextDemolishTarget(structure("hole", 0, [item("wood-1", "wood")], [bug("ant-1", "ant")])),
    ).toEqual({ kind: "bug", id: "ant-1" });
    expect(getNextDemolishTarget(structure("hole", 0, [item("wood-1", "wood")], []))).toEqual({
      kind: "item",
      id: "wood-1",
    });
    expect(getNextDemolishTarget(structure("hole", 0, [], []))).toEqual({ kind: "structure" });
  });
});

describe("getDemolishResultingUpgradeLevel", () => {
  it("keeps the level that still has upgrade contents and drops empty higher levels", () => {
    const levelTwo = structure(
      "workshop",
      2,
      [
        ...workshopBuildItems(),
        ...copies("wood", 1, "upgrade-wood"),
        ...copies("brick", 1, "upgrade-brick"),
        ...copies("iron_ingot", 1, "ingot"),
        ...copies("glass", 1, "glass"),
        ...copies("concrete", 1, "concrete"),
        ...copies("steel", 1, "steel"),
        ...copies("furniture", 1, "furniture"),
      ],
      [bug("beetle-1", "beetle"), bug("ladybug-1", "ladybug"), bug("ladybug-2", "ladybug")],
    );

    expect(getDemolishResultingUpgradeLevel(levelTwo)).toBe(2);
    expect(
      getDemolishResultingUpgradeLevel({
        ...levelTwo,
        items: [
          ...workshopBuildItems(),
          ...copies("wood", 1, "upgrade-wood"),
          ...copies("brick", 1, "upgrade-brick"),
          ...copies("iron_ingot", 1, "ingot"),
          ...copies("glass", 1, "glass"),
        ],
        bugs: [bug("beetle-1", "beetle"), bug("ladybug-1", "ladybug")],
      }),
    ).toBe(1);
    expect(getDemolishResultingUpgradeLevel(structure("hole", 0, [], []))).toBe(0);
  });
});
