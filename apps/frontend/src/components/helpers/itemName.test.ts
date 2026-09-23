import { WORKSHOP_ITEM_TYPES } from "@happy-little-bug-town/utils";
import { describe, expect, it } from "vitest";

import { itemTypeToName } from "./itemName";

describe("item names", () => {
  it("names every workshop item", () => {
    for (const itemType of WORKSHOP_ITEM_TYPES) {
      expect(itemTypeToName(itemType).length).toBeGreaterThan(0);
    }
  });

  it("uses the player-facing label", () => {
    expect(itemTypeToName("axe")).toBe("Axe");
    expect(itemTypeToName("hammer_and_chisel")).toBe("Hammer and chisel");
    expect(itemTypeToName("leaf_rake")).toBe("Rake");
    expect(itemTypeToName("wheelbarrel")).toBe("Wheelbarrel");
  });
});
