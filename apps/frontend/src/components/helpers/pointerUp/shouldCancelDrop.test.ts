import { BugType, ItemType, StructureType } from "@happy-little-bug-town/utils";
import { describe, expect, it } from "vitest";

import { Bug } from "../../../types/bug";
import { Item } from "../../../types/item";
import { Stack } from "../../../types/stack";
import { Structure } from "../../../types/structure";
import { shouldCancelBugDrop } from "./shouldCancelBugDrop";
import { shouldCancelDrop } from "./shouldCancelDrop";
import { shouldCancelItemDrop } from "./shouldCancelItemDrop";
import { shouldCancelStackDrop } from "./shouldCancelStackDrop";
import { shouldCancelStructureDrop } from "./shouldCancelStructureDrop";

function item(id: string, itemType: ItemType, ingredients: ItemType[] = []): Item {
  return {
    id,
    x: 1,
    y: 1,
    itemType,
    items: ingredients.map((ingredient, index) => ({ id: `${id}-${index}`, itemType: ingredient })),
  };
}

function bug(id: string, bugType: BugType, food: ItemType[] = []): Bug {
  return {
    id,
    x: 1,
    y: 1,
    bugType,
    items: food.map((itemType, index) => ({ id: `${id}-${index}`, itemType })),
  };
}

function structure(
  structureType: StructureType,
  items: { id: string; itemType: ItemType }[] = [],
): Structure {
  return {
    id: structureType,
    x: 1,
    y: 1,
    structureType,
    upgradeLevel: 0,
    items,
    bugs: [],
  };
}

function stack(
  id: string,
  itemType: ItemType,
  bugs: { id: string; bugType: BugType }[] = [],
): Stack {
  return { id, x: 1, y: 1, itemType, itemsCount: 2, bugs };
}

const leafRake = item("rake", "leaf_rake", [
  "leaf_part",
  "leaf_part",
  "leaf_part",
  "brick",
  "wood",
  "root",
  "root",
]);
const builtWorkshop = structure("workshop", [
  { id: "leaf-1", itemType: "leaf_part" },
  { id: "leaf-2", itemType: "leaf_part" },
  { id: "leaf-3", itemType: "leaf_part" },
  { id: "rock-1", itemType: "little_rock" },
  { id: "rock-2", itemType: "little_rock" },
  { id: "stick", itemType: "stick" },
  { id: "root", itemType: "root" },
]);

describe("cancelling an item drop", () => {
  it("allows an empty cell and cancels a footprint that does not fit", () => {
    const stick = item("stick", "stick");

    expect(shouldCancelItemDrop(stick, undefined, { x: 2, y: 2 }, [], 3, 3, [])).toBeNull();
    expect(
      shouldCancelItemDrop(item("hammer", "hammer"), undefined, { x: 3, y: 1 }, [], 3, 3, []),
    ).toBe("cancel");
  });

  it("crafts onto an unfinished item and cancels a resource that is not active", () => {
    const axe = item("axe", "axe");

    expect(
      shouldCancelItemDrop(item("rock", "little_rock"), axe, { x: 1, y: 1 }, [], 3, 3, []),
    ).toBeNull();
    expect(shouldCancelItemDrop(item("stick", "stick"), axe, { x: 1, y: 1 }, [], 3, 3, [])).toBe(
      "cancel",
    );
  });

  it("creates a stack when the tool exists and reports a blocked stack footprint", () => {
    const leaf = item("leaf", "leaf_part");
    const otherLeaf = item("other-leaf", "leaf_part");
    const blocker = bug("blocker", "ant");

    expect(
      shouldCancelItemDrop(leaf, otherLeaf, { x: 1, y: 1 }, [leafRake], 2, 2, [otherLeaf]),
    ).toBeNull();
    expect(
      shouldCancelItemDrop(leaf, otherLeaf, { x: 1, y: 1 }, [leafRake], 2, 2, [otherLeaf, blocker]),
    ).toBe("stackCreateBlocked");
    expect(shouldCancelItemDrop(leaf, otherLeaf, { x: 1, y: 1 }, [], 2, 2, [otherLeaf])).toBeNull();
  });

  it("joins a matching stack, feeds a hungry bug, and discards on ground", () => {
    const leaf = item("leaf", "leaf_part");

    expect(
      shouldCancelItemDrop(leaf, stack("pile", "leaf_part"), { x: 1, y: 1 }, [leafRake], 4, 4, []),
    ).toBeNull();
    expect(
      shouldCancelItemDrop(
        item("rock", "little_rock"),
        stack("pile", "leaf_part"),
        { x: 1, y: 1 },
        [],
        4,
        4,
        [],
      ),
    ).toBe("cancel");
    expect(
      shouldCancelItemDrop(leaf, bug("beetle", "beetle"), { x: 1, y: 1 }, [], 4, 4, []),
    ).toBeNull();
    expect(
      shouldCancelItemDrop(
        leaf,
        bug("beetle", "beetle", ["leaf_part", "leaf_part"]),
        { x: 1, y: 1 },
        [],
        4,
        4,
        [],
      ),
    ).toBe("cancel");
    expect(
      shouldCancelItemDrop(item("stick", "stick"), structure("hole"), { x: 1, y: 1 }, [], 4, 4, []),
    ).toBeNull();
    expect(
      shouldCancelItemDrop(item("hammer", "hammer"), builtWorkshop, { x: 1, y: 1 }, [], 4, 4, []),
    ).toBe("cancel");
  });
});

describe("cancelling a bug, structure, or stack drop", () => {
  it("asks for food when a power or stack drop requires a fed bug", () => {
    const beetle = bug("beetle", "beetle");
    const ant = bug("ant", "ant");

    expect(shouldCancelBugDrop(ant, undefined)).toBeNull();
    expect(shouldCancelBugDrop(beetle, builtWorkshop)).toBe("hungryBug");
    expect(
      shouldCancelBugDrop(bug("beetle", "beetle", ["leaf_part", "leaf_part"]), builtWorkshop),
    ).toBeNull();
    expect(shouldCancelBugDrop(ant, structure("tavern"))).toBe("cancel");
    expect(shouldCancelBugDrop(ant, stack("pile", "leaf_part"))).toBe("hungryBug");
    expect(
      shouldCancelBugDrop(
        bug("ant", "ant", ["nettle_soup", "nettle_soup"]),
        stack("pile", "leaf_part"),
      ),
    ).toBeNull();
    expect(
      shouldCancelBugDrop(
        bug("ant", "ant", ["nettle_soup", "nettle_soup"]),
        stack("full", "leaf_part", [ant]),
      ),
    ).toBe("cancel");
  });

  it("cancels a structure that cannot move or does not fit", () => {
    expect(shouldCancelStructureDrop(structure("hole"), { x: 1, y: 1 }, [], 4, 4, [])).toBe(
      "cancel",
    );
    expect(
      shouldCancelStructureDrop(structure("workshop"), { x: 1, y: 1 }, [], 4, 4, []),
    ).toBeNull();
    expect(shouldCancelStructureDrop(structure("workshop"), { x: 3, y: 1 }, [], 4, 4, [])).toBe(
      "cancel",
    );
  });

  it("merges matching stacks and cancels a blocked or mismatched drop", () => {
    const leaves = stack("leaves", "leaf_part");

    expect(shouldCancelStackDrop(leaves, undefined, { x: 1, y: 1 }, [], 4, 4, [])).toBeNull();
    expect(shouldCancelStackDrop(leaves, undefined, { x: 4, y: 1 }, [], 4, 4, [])).toBe("cancel");
    expect(
      shouldCancelStackDrop(
        leaves,
        stack("more", "leaf_part"),
        { x: 1, y: 1 },
        [leafRake],
        4,
        4,
        [],
      ),
    ).toBeNull();
    expect(
      shouldCancelStackDrop(
        leaves,
        stack("rocks", "little_rock"),
        { x: 1, y: 1 },
        [leafRake],
        4,
        4,
        [],
      ),
    ).toBe("cancel");
  });
});

describe("cancelling a drop by entity kind", () => {
  it("delegates to the matching rule", () => {
    const stick = item("stick", "stick");
    const beetle = bug("beetle", "beetle");

    expect(
      shouldCancelDrop({
        entityToDrop: stick,
        targetEntity: undefined,
        dropPosition: { x: 2, y: 2 },
        cols: 3,
        rows: 3,
        entities: [stick],
        items: [],
      }),
    ).toBeNull();
    expect(
      shouldCancelDrop({
        entityToDrop: beetle,
        targetEntity: builtWorkshop,
        dropPosition: { x: 1, y: 1 },
        cols: 4,
        rows: 4,
        entities: [beetle, builtWorkshop],
        items: [],
      }),
    ).toBe("hungryBug");
    expect(
      shouldCancelDrop({
        entityToDrop: structure("hole"),
        targetEntity: undefined,
        dropPosition: { x: 1, y: 1 },
        cols: 4,
        rows: 4,
        entities: [structure("hole")],
        items: [],
      }),
    ).toBe("cancel");
  });
});
