import { afterEach, describe, expect, it, vi } from "vitest";

import { BugType, ItemType, StructureType } from "@happy-little-bug-town/utils";

import { generateDiggableItem } from "./diggableItems.js";

function ownedItems(itemTypes: ItemType[]): { itemType: ItemType }[] {
  return itemTypes.map((itemType) => ({ itemType }));
}

function ownedBugs(bugTypes: BugType[]): { bugType: BugType }[] {
  return bugTypes.map((bugType) => ({ bugType }));
}

function repeated(itemType: ItemType, count: number): ItemType[] {
  return Array.from({ length: count }, () => itemType);
}

const holeTypes: ItemType[] = ["leaf_part", "little_rock", "root", "stick"];
const anthillTypes: ItemType[] = [...holeTypes, "iron_ore", "clay", "glass", "paper"];

describe("generateDiggableItem", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function roll(value: number): void {
    vi.spyOn(Math, "random").mockReturnValue(value);
  }

  it("draws only from types the player does not own yet", () => {
    roll(0.99);

    expect(
      generateDiggableItem(
        "hole",
        ownedItems(["leaf_part", "little_rock", "root"]),
        ownedBugs(["beetle"]),
      ),
    ).toBe("stick");
    expect(generateDiggableItem("hole", ownedItems([...holeTypes, "axe"]), [])).toBe("beetle");
    expect(generateDiggableItem("workshop", ownedItems(holeTypes), ownedBugs(["ant"]))).toBe(
      "beetle",
    );
  });

  it("uses the structure's dig pool, including later ground stages", () => {
    roll(0);

    expect(generateDiggableItem("hole", [], [])).toBe("leaf_part");
    expect(generateDiggableItem("anthill", ownedItems(holeTypes), ownedBugs(["beetle"]))).toBe(
      "iron_ore",
    );
    expect(
      generateDiggableItem(
        "termite_mound",
        ownedItems(anthillTypes),
        ownedBugs(["beetle", "greenfly"]),
      ),
    ).toBe("gravel");
    expect(
      generateDiggableItem("beehive", ownedItems(anthillTypes), ownedBugs(["beetle", "greenfly"])),
    ).toBe("gravel");
  });

  it("weights a complete collection toward types the player owns less of", () => {
    const items = ownedItems([...repeated("leaf_part", 9), "little_rock", "root", "stick"]);
    const bugs = ownedBugs(["beetle"]);
    const totalWeight = 0.1 + 0.5 * 4;

    roll(0);
    expect(generateDiggableItem("hole", items, bugs)).toBe("leaf_part");

    roll(1.7 / totalWeight);
    expect(generateDiggableItem("hole", items, bugs)).toBe("beetle");
  });
});
