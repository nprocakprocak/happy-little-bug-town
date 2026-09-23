import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { queryKeys } from "../../constants/queryKeys";
import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Structure } from "../../types/structure";
import { DropActionState } from "../types/dropActionState";
import { dropAction } from "./dropAction";
import { dropBugOnStructure } from "./dropActions/dropBugOnStructure";
import { dropItemOnEmpty } from "./dropActions/dropItemOnEmpty";
import { dropItemOnItemToCraft } from "./dropActions/dropItemOnItemToCraft";
import { dropItemOnItemToStack } from "./dropActions/dropItemOnItemToStack";
import { evolveStructureIfReady } from "./dropActions/evolveStructureIfReady";

vi.mock("./dropActions/dropBugOnEmpty", () => ({ dropBugOnEmpty: vi.fn() }));
vi.mock("./dropActions/dropBugOnStack", () => ({ dropBugOnStack: vi.fn() }));
vi.mock("./dropActions/dropBugOnStructure", () => ({ dropBugOnStructure: vi.fn() }));
vi.mock("./dropActions/dropBugToDiscard", () => ({ dropBugToDiscard: vi.fn() }));
vi.mock("./dropActions/dropFoodOnBug", () => ({ dropFoodOnBug: vi.fn() }));
vi.mock("./dropActions/dropItemOnEmpty", () => ({ dropItemOnEmpty: vi.fn() }));
vi.mock("./dropActions/dropItemOnItemToCraft", () => ({ dropItemOnItemToCraft: vi.fn() }));
vi.mock("./dropActions/dropItemOnItemToStack", () => ({ dropItemOnItemToStack: vi.fn() }));
vi.mock("./dropActions/dropItemOnStack", () => ({ dropItemOnStack: vi.fn() }));
vi.mock("./dropActions/dropItemOnStructure", () => ({ dropItemOnStructure: vi.fn() }));
vi.mock("./dropActions/dropItemToDiscard", () => ({ dropItemToDiscard: vi.fn() }));
vi.mock("./dropActions/dropStackOnEmpty", () => ({ dropStackOnEmpty: vi.fn() }));
vi.mock("./dropActions/dropStackOnStack", () => ({ dropStackOnStack: vi.fn() }));
vi.mock("./dropActions/dropStructureOnEmpty", () => ({ dropStructureOnEmpty: vi.fn() }));
vi.mock("./dropActions/dropToSwap", () => ({ dropToSwap: vi.fn() }));
vi.mock("./dropActions/evolveStructureIfReady", () => ({ evolveStructureIfReady: vi.fn() }));

function item(id: string): Item {
  return { id, x: 1, y: 1, itemType: "stick", items: [] };
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

function state(items: Item[] = [], structures: Structure[] = []): DropActionState {
  return { items, stacks: [], bugs: [], structures };
}

describe("drop action routing", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("applies the first successful item-on-item craft and skips stacking", async () => {
    const crafted = state();
    vi.mocked(dropItemOnItemToCraft).mockResolvedValue(crafted);
    const queryClient = new QueryClient();

    const result = await dropAction({
      entityToDrop: item("rock"),
      targetEntity: item("axe"),
      dropPosition: { x: 2, y: 2 },
      items: [],
      stacks: [],
      bugs: [],
      structures: [],
      queryClient,
    });

    expect(result).toBe(crafted);
    expect(dropItemOnItemToStack).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(queryKeys.items)).toBe(crafted.items);
  });

  it("moves an item onto an empty cell", async () => {
    const moved = state([item("stick")]);
    vi.mocked(dropItemOnEmpty).mockResolvedValue(moved);
    const queryClient = new QueryClient();
    const stick = item("stick");

    await dropAction({
      entityToDrop: stick,
      targetEntity: undefined,
      dropPosition: { x: 3, y: 4 },
      items: [stick],
      stacks: [],
      bugs: [],
      structures: [],
      queryClient,
    });

    expect(dropItemOnEmpty).toHaveBeenCalledWith(
      stick,
      { x: 3, y: 4 },
      state([stick]),
      queryClient,
    );
    expect(queryClient.getQueryData(queryKeys.items)).toBe(moved.items);
  });

  it("evolves a structure after a bug is accepted", async () => {
    const accepted = state([], [workshop()]);
    const evolved = state([], [{ ...workshop(), structureType: "anthill" }]);
    vi.mocked(dropBugOnStructure).mockResolvedValue(accepted);
    vi.mocked(evolveStructureIfReady).mockResolvedValue(evolved);
    const queryClient = new QueryClient();
    const ant: Bug = { id: "ant", x: 1, y: 1, bugType: "ant", items: [] };
    const target = workshop();

    const result = await dropAction({
      entityToDrop: ant,
      targetEntity: target,
      dropPosition: { x: 1, y: 1 },
      items: [],
      stacks: [],
      bugs: [ant],
      structures: [target],
      queryClient,
    });

    expect(evolveStructureIfReady).toHaveBeenCalledWith(target, accepted, queryClient);
    expect(result).toBe(evolved);
  });

  it("rejects a drop onto an entity that accepts none of the actions", async () => {
    const queryClient = new QueryClient();

    await expect(
      dropAction({
        entityToDrop: item("stick"),
        targetEntity: workshop(),
        dropPosition: { x: 1, y: 1 },
        items: [],
        stacks: [],
        bugs: [],
        structures: [],
        queryClient,
      }),
    ).rejects.toThrow("Invalid drop action");
  });
});
