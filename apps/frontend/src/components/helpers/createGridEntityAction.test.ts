import { ItemType } from "@happy-little-bug-town/utils";
import { describe, expect, it } from "vitest";

import { Item } from "../../types/item";
import { Structure } from "../../types/structure";
import { beetleBuildAction, workshopCreateItemAction } from "./createGridEntityAction";

function structure(structureType: Structure["structureType"]): Structure {
  return {
    id: structureType,
    x: 1,
    y: 1,
    structureType,
    upgradeLevel: 0,
    items: [],
    bugs: [],
  };
}

function item(itemType: ItemType): Item {
  return { id: itemType, x: 1, y: 1, itemType, items: [] };
}

describe("creating a grid entity", () => {
  it("places a buildable structure in the first free cell", () => {
    expect(beetleBuildAction(structure("hole"), 3, 3, [])).toBeNull();
    expect(beetleBuildAction(structure("workshop"), 3, 3, [])).toEqual({
      kind: "ok",
      payload: { structureType: "workshop", x: 1, y: 1 },
    });
    expect(beetleBuildAction(structure("workshop"), 2, 2, [])).toEqual({
      kind: "error",
      reason: "noSpace",
    });
  });

  it("places an unlocked recipe and refuses a locked, duplicate, or cramped one", () => {
    expect(
      workshopCreateItemAction({
        itemType: "axe",
        workshopUpgradeLevel: 0,
        items: [],
        cols: 3,
        rows: 3,
        entities: [],
      }),
    ).toEqual({ kind: "ok", payload: { itemType: "axe", x: 1, y: 1 } });
    expect(
      workshopCreateItemAction({
        itemType: "hoe",
        workshopUpgradeLevel: 0,
        items: [],
        cols: 3,
        rows: 3,
        entities: [],
      }),
    ).toBeNull();
    expect(
      workshopCreateItemAction({
        itemType: "hammer",
        workshopUpgradeLevel: 0,
        items: [item("hammer")],
        cols: 3,
        rows: 3,
        entities: [],
      }),
    ).toBeNull();
    expect(
      workshopCreateItemAction({
        itemType: "axe",
        workshopUpgradeLevel: 0,
        items: [],
        cols: 1,
        rows: 1,
        entities: [{ x: 1, y: 1, bugType: "ant" }],
      }),
    ).toEqual({ kind: "error", reason: "noSpace" });
  });
});
