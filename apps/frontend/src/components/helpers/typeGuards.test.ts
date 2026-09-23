import { describe, expect, it } from "vitest";

import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { isBug, isItem, isStack, isStructure } from "./typeGuards";

describe("grid entity type guards", () => {
  const stack: Stack = {
    id: "stack",
    x: 1,
    y: 1,
    itemType: "leaf_part",
    itemsCount: 2,
    bugs: [],
  };
  const bug: Bug = { id: "bug", x: 1, y: 1, bugType: "ant", items: [] };
  const structure: Structure = {
    id: "structure",
    x: 1,
    y: 1,
    structureType: "workshop",
    upgradeLevel: 0,
    items: [],
    bugs: [],
  };
  const item: Item = { id: "item", x: 1, y: 1, itemType: "stick", items: [] };

  it("recognises each entity kind", () => {
    expect(isStack(stack)).toBe(true);
    expect(isBug(bug)).toBe(true);
    expect(isStructure(structure)).toBe(true);
    expect(isItem(item)).toBe(true);
  });

  it("does not treat a stack, bug, or structure as an item", () => {
    expect(isItem(stack)).toBe(false);
    expect(isItem(bug)).toBe(false);
    expect(isItem(structure)).toBe(false);
    expect(isStack(item)).toBe(false);
    expect(isBug(item)).toBe(false);
    expect(isStructure(item)).toBe(false);
  });
});
