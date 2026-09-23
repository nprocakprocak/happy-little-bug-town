import { ITEM_TYPES } from "@happy-little-bug-town/utils";
import { describe, expect, it } from "vitest";

import { itemTypeToImageForItem, itemTypeToImageForStack } from "./itemImages";

describe("item images", () => {
  it("maps every item type to an image", () => {
    for (const itemType of ITEM_TYPES) {
      expect(itemTypeToImageForItem(itemType)).toMatch(/^\/items\/.+\.webp$/);
    }
  });

  it("uses the plural flower sprite", () => {
    expect(itemTypeToImageForItem("flower")).toBe("/items/flowers.webp");
  });

  it("maps stackable items to pile sprites and rejects the rest", () => {
    expect(itemTypeToImageForStack("leaf_part")).toBe("/stacks/leaf-parts.webp");
    expect(itemTypeToImageForStack("rotten_apple")).toBe("/stacks/apples-stack.webp");
    expect(() => itemTypeToImageForStack("axe")).toThrow("Unstackable item type: axe");
  });
});
