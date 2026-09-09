import { hasEmptyGridCell, Positionable } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { extractItemFromStack } from "../../../api/stacks";
import { updateBugsCache } from "../../../hooks/useBugs";
import { updateStacksCache } from "../../../hooks/useStacks";
import { Stack } from "../../../types/stack";
import { spawnExtractedItem } from "./spawnExtractedEntity";

interface ClickStackArgs {
  stack: Stack;
  queryClient: QueryClient;
  beginAutoRouteIfPossible: Parameters<typeof spawnExtractedItem>[3];
  rows: number;
  cols: number;
  entities: Positionable[];
}

export async function clickStack({
  stack,
  queryClient,
  beginAutoRouteIfPossible,
  rows,
  cols,
  entities,
}: ClickStackArgs): Promise<{ kind: "done" } | { kind: "noSpace" }> {
  if (!hasEmptyGridCell(rows, cols, entities)) {
    return { kind: "noSpace" };
  }

  const result = await extractItemFromStack(stack.id);

  updateStacksCache(queryClient, (stacks) => {
    if (result.stackDissolved) {
      return stacks.filter((existing) => existing.id !== stack.id);
    }
    return stacks.map((existing) =>
      existing.id === stack.id ? { ...existing, itemsCount: existing.itemsCount - 1 } : existing,
    );
  });

  if (result.releasedBugs.length > 0) {
    updateBugsCache(queryClient, (bugs) => [
      ...bugs,
      ...result.releasedBugs.map((bug) => ({
        ...bug,
        fromX: stack.x,
        fromY: stack.y,
      })),
    ]);
  }

  spawnExtractedItem(
    result.extractedItem,
    { x: stack.x, y: stack.y },
    queryClient,
    beginAutoRouteIfPossible,
    {
      stackId: stack.id,
    },
  );

  return { kind: "done" };
}
