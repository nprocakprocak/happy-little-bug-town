import { BugType, ItemType, StructureType } from "@happy-little-bug-town/utils";
import { describe, expect, it } from "vitest";

import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Structure } from "../../types/structure";
import { calculateCellProperties } from "./interactionCell";

function item(id: string, itemType: ItemType, ingredients: ItemType[] = []): Item {
  return {
    id,
    x: 1,
    y: 1,
    itemType,
    items: ingredients.map((ingredient, index) => ({ id: `${id}-${index}`, itemType: ingredient })),
  };
}

function bug(id: string, bugType: BugType): Bug {
  return { id, x: 2, y: 3, bugType, items: [] };
}

function structure(
  structureType: StructureType,
  extras: Partial<Pick<Structure, "items" | "bugs" | "x" | "y">> = {},
): Structure {
  return {
    id: structureType,
    x: 1,
    y: 1,
    structureType,
    upgradeLevel: 0,
    items: [],
    bugs: [],
    ...extras,
  };
}

const hammer = item("hammer", "hammer", ["brick", "wood", "root", "root"]);
const builtBeetleHouse = structure("beetle_house", {
  items: [
    { id: "leaf-1", itemType: "leaf_part" },
    { id: "leaf-2", itemType: "leaf_part" },
    { id: "rock", itemType: "little_rock" },
    { id: "stick-1", itemType: "stick" },
    { id: "stick-2", itemType: "stick" },
  ],
});

describe("interaction cell properties", () => {
  const base = {
    cellPosition: { x: 4, y: 5 },
    cellIndex: 7,
    isGridVisible: true,
    isDemolishMode: false,
    dragState: null,
    items: [],
  };

  it("styles an empty visible cell and refuses to drag it", () => {
    expect(calculateCellProperties({ ...base, entity: undefined })).toEqual({
      placementStyle: { gridColumn: 4, gridRow: 5 },
      dragStyle: {},
      canDrag: false,
      isDemolishLocked: false,
      cellBackgroundClass: "bg-zinc-200/20",
    });
  });

  it("hides the cell background when the grid is hidden", () => {
    expect(
      calculateCellProperties({ ...base, entity: undefined, isGridVisible: false })
        .cellBackgroundClass,
    ).toBe("bg-transparent");
  });

  it("lets a bug be dragged from its own origin", () => {
    const ant = bug("ant", "ant");

    expect(calculateCellProperties({ ...base, entity: ant })).toMatchObject({
      placementStyle: { gridColumn: 2, gridRow: 3 },
      canDrag: true,
      isDemolishLocked: false,
    });
  });

  it("follows the pointer while this cell is the drag source", () => {
    expect(
      calculateCellProperties({
        ...base,
        entity: bug("ant", "ant"),
        dragState: { index: 7, dx: 12, dy: -3 },
      }).dragStyle,
    ).toEqual({ transform: "translate(12px, -3px)" });
  });

  it("allows an unfinished structure to move and locks a finished one during demolition", () => {
    expect(calculateCellProperties({ ...base, entity: structure("workshop") }).canDrag).toBe(true);
    expect(calculateCellProperties({ ...base, entity: structure("hole") }).canDrag).toBe(false);

    const locked = calculateCellProperties({
      ...base,
      entity: builtBeetleHouse,
      isDemolishMode: true,
      items: [hammer],
    });
    expect(locked.isDemolishLocked).toBe(true);
    expect(locked.canDrag).toBe(false);
  });

  it("keeps a self-generating house from being dragged or demolished", () => {
    const house = structure("beetle_house", {
      ...builtBeetleHouse,
      bugs: Array.from({ length: 10 }, (_, index) => ({
        id: `beetle-${index}`,
        bugType: "beetle",
      })),
    });

    expect(
      calculateCellProperties({
        ...base,
        entity: house,
        isDemolishMode: true,
        items: [hammer],
      }),
    ).toMatchObject({ canDrag: false, isDemolishLocked: false });
  });
});
