import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { queryKeys } from "../../../constants/queryKeys";
import { Bug } from "../../../types/bug";
import { Item } from "../../../types/item";
import { Structure } from "../../../types/structure";
import { spawnExtractedBug, spawnExtractedItem } from "./spawnExtractedEntity";

function item(): Item {
  return { id: "stick", x: 4, y: 5, itemType: "stick", items: [] };
}

function bug(): Bug {
  return { id: "ant", x: 4, y: 5, bugType: "ant", items: [] };
}

function structure(): Structure {
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

describe("spawning an extracted entity", () => {
  it("keeps an item in the auto route instead of adding a flight", () => {
    const queryClient = new QueryClient();
    const workshop = structure();
    queryClient.setQueryData(queryKeys.structures, [workshop]);
    queryClient.setQueryData(queryKeys.stacks, []);
    queryClient.setQueryData(queryKeys.items, []);
    const begin = vi.fn(() => true);

    spawnExtractedItem(item(), { x: 2, y: 3 }, queryClient, begin);

    expect(begin).toHaveBeenCalledWith(item(), { x: 2, y: 3 }, [workshop], [], [], undefined);
    expect(queryClient.getQueryData<Item[]>(queryKeys.items)).toEqual([]);
  });

  it("adds a flying item when no auto route starts", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.items, []);

    spawnExtractedItem(item(), { x: 2, y: 3 }, queryClient, () => false);

    expect(queryClient.getQueryData<Item[]>(queryKeys.items)).toEqual([
      { ...item(), fromX: 2, fromY: 3 },
    ]);
  });

  it("adds a flying bug when no auto route starts", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.structures, []);
    queryClient.setQueryData(queryKeys.bugs, []);

    spawnExtractedBug(bug(), { x: 6, y: 7 }, queryClient, () => false);

    expect(queryClient.getQueryData<Bug[]>(queryKeys.bugs)).toEqual([
      { ...bug(), fromX: 6, fromY: 7 },
    ]);
  });
});
