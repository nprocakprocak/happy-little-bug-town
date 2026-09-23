import { ItemType } from "@happy-little-bug-town/utils";
import { describe, expect, it } from "vitest";

import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { stackInvalidDropClass, structureInvalidDropClass } from "./structureInvalidItemDrop";

const transition = "transition-[filter,opacity] duration-200 motion-reduce:transition-none";

function item(itemType: ItemType, ingredients: ItemType[] = []): Item {
  return {
    id: itemType,
    x: 1,
    y: 1,
    itemType,
    items: ingredients.map((ingredient, index) => ({
      id: `${ingredient}-${index}`,
      itemType: ingredient,
    })),
  };
}

function bug(food: ItemType[]): Bug {
  return {
    id: "bug",
    x: 1,
    y: 1,
    bugType: "ant",
    items: food.map((itemType, index) => ({ id: `food-${index}`, itemType })),
  };
}

function workshop(): Structure {
  return {
    id: "workshop",
    x: 1,
    y: 1,
    structureType: "workshop",
    upgradeLevel: 0,
    items: [],
    bugs: [],
  };
}

function pile(bugs: Bug[] = []): Stack {
  return { id: "pile", x: 1, y: 1, itemType: "leaf_part", itemsCount: 1, bugs };
}

describe("invalid drop feedback", () => {
  it("stays neutral without a drag and on ground that ignores the highlight", () => {
    const hole: Structure = { ...workshop(), id: "hole", structureType: "hole" };

    expect(structureInvalidDropClass(null, workshop(), true)).toBe(transition);
    expect(structureInvalidDropClass({ dx: 0, dy: 0, entity: item("stick") }, hole, true)).toBe(
      transition,
    );
  });

  it("highlights an accepted structure drop and greys out a rejected one", () => {
    const drag = { dx: 1, dy: 2, entity: item("leaf_part") };

    expect(structureInvalidDropClass(drag, workshop(), true)).toBe(`${transition} brightness-125`);
    expect(structureInvalidDropClass(drag, workshop(), false)).toBe(transition);
    expect(
      structureInvalidDropClass({ dx: 0, dy: 0, entity: item("hammer") }, workshop(), true),
    ).toBe(`${transition} grayscale opacity-50`);
  });

  it("greys out a bug the structure will not take", () => {
    const ant = bug([]);
    expect(structureInvalidDropClass({ dx: 0, dy: 0, entity: ant }, workshop())).toBe(
      `${transition} grayscale opacity-50`,
    );
  });

  it("highlights a matching or fed stack drop and greys out the rest", () => {
    const leaf = item("leaf_part");
    const fedAnt = bug(["nettle_soup", "nettle_soup"]);
    const hungryAnt = bug([]);

    expect(stackInvalidDropClass(null, pile())).toBe(transition);
    expect(stackInvalidDropClass({ dx: 0, dy: 0, entity: leaf }, pile(), true)).toBe(
      `${transition} brightness-125`,
    );
    expect(stackInvalidDropClass({ dx: 0, dy: 0, entity: item("stick") }, pile())).toBe(
      `${transition} grayscale opacity-50`,
    );
    expect(stackInvalidDropClass({ dx: 0, dy: 0, entity: fedAnt }, pile(), true)).toBe(
      `${transition} brightness-125`,
    );
    expect(stackInvalidDropClass({ dx: 0, dy: 0, entity: hungryAnt }, pile())).toBe(
      `${transition} grayscale opacity-50`,
    );
    expect(stackInvalidDropClass({ dx: 0, dy: 0, entity: workshop() }, pile(), true)).toBe(
      transition,
    );
  });
});
