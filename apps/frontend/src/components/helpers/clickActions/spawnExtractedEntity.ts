import { Position } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/queryKeys";
import { updateBugsCache } from "../../../hooks/useBugs";
import { updateItemsCache } from "../../../hooks/useItems";
import { Bug } from "../../../types/bug";
import { Item } from "../../../types/item";
import { Stack } from "../../../types/stack";
import { Structure } from "../../../types/structure";

interface AutoRouteExclude {
  structureId?: string;
  stackId?: string;
  onlyOperational?: boolean;
}

export function spawnExtractedItem(
  item: Item,
  origin: Position,
  queryClient: QueryClient,
  beginAutoRouteIfPossible: (
    item: Item,
    origin: Position,
    structures: Structure[],
    stacks: Stack[],
    gridItems: Item[],
    exclude?: AutoRouteExclude,
  ) => boolean,
  exclude?: AutoRouteExclude,
) {
  const latestStructures = queryClient.getQueryData<Structure[]>(queryKeys.structures) ?? [];
  const latestStacks = queryClient.getQueryData<Stack[]>(queryKeys.stacks) ?? [];
  const latestItems = queryClient.getQueryData<Item[]>(queryKeys.items) ?? [];

  if (
    !beginAutoRouteIfPossible(item, origin, latestStructures, latestStacks, latestItems, exclude)
  ) {
    updateItemsCache(queryClient, (prev) => [
      ...prev,
      { ...item, fromX: origin.x, fromY: origin.y },
    ]);
  }
}

export function spawnExtractedBug(
  bug: Bug,
  origin: Position,
  queryClient: QueryClient,
  beginAutoRouteBugIfPossible: (
    bug: Bug,
    origin: Position,
    structures: Structure[],
    exclude?: AutoRouteExclude,
  ) => boolean,
  exclude?: AutoRouteExclude,
) {
  const latestStructures = queryClient.getQueryData<Structure[]>(queryKeys.structures) ?? [];

  if (!beginAutoRouteBugIfPossible(bug, origin, latestStructures, exclude)) {
    updateBugsCache(queryClient, (prev) => [...prev, { ...bug, fromX: origin.x, fromY: origin.y }]);
  }
}
