import { WORKSHOP_ITEM_TYPES } from "@happy-little-bug-town/utils";
import { describe, expect, it } from "vitest";

import { itemTypeToDescription } from "./itemDescription";

describe("item descriptions", () => {
  it("describes every workshop item", () => {
    for (const itemType of WORKSHOP_ITEM_TYPES) {
      expect(itemTypeToDescription(itemType)?.length).toBeGreaterThan(0);
    }
  });

  it("explains what the tool is for", () => {
    expect(itemTypeToDescription("axe")).toBe("Required to build woodcutter");
    expect(itemTypeToDescription("hammer")).toBe("Allows to relocate and demolish structures");
    expect(itemTypeToDescription("leaf_rake")).toContain("stacks");
  });
});
