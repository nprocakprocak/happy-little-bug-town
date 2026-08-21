import { useCallback, useRef, useState } from "react";
import { canStackItemType, Position } from "@happy-little-bug-town/utils";
import { useQueryClient } from "@tanstack/react-query";

import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { findStackWithAssignedAnt } from "../utils/findStackWithAssignedAnt";
import { updateItemsCache, useAddItemToStackMutation } from "./useItems";
import { updateStacksCache } from "./useStacks";

interface PendingAutoStack {
  stackId: string;
  item: Item;
}

export function useAutoStackDugItems() {
  const queryClient = useQueryClient();
  const addItemToStackMutation = useAddItemToStackMutation();
  const [autoStackFlights, setAutoStackFlights] = useState<Item[]>([]);
  const pendingByItemIdRef = useRef(new Map<string, PendingAutoStack>());

  const beginAutoStackIfPossible = useCallback(
    (item: Item, origin: Position, stacks: Stack[], gridItems: Item[]): boolean => {
      if (!canStackItemType(item.itemType, gridItems)) {
        return false;
      }

      const targetStack = findStackWithAssignedAnt(item.itemType, stacks, origin);
      if (!targetStack) {
        return false;
      }

      pendingByItemIdRef.current.set(item.id, { stackId: targetStack.id, item });
      setAutoStackFlights((prev) => [
        ...prev,
        {
          ...item,
          x: targetStack.x,
          y: targetStack.y,
          fromX: origin.x,
          fromY: origin.y,
        },
      ]);
      return true;
    },
    [],
  );

  const completeAutoStackFlight = useCallback(
    (entityId: string): boolean => {
      const pending = pendingByItemIdRef.current.get(entityId);
      if (!pending) {
        return false;
      }

      pendingByItemIdRef.current.delete(entityId);
      setAutoStackFlights((prev) => prev.filter((item) => item.id !== entityId));

      // optimistic update
      updateStacksCache(queryClient, (stacks) =>
        stacks.map((stack) =>
          stack.id === pending.stackId ? { ...stack, itemsCount: stack.itemsCount + 1 } : stack,
        ),
      );

      addItemToStackMutation.mutate(
        { itemId: entityId, stackId: pending.stackId },
      );
      return true;
    },
    [addItemToStackMutation, queryClient],
  );

  return { autoStackFlights, beginAutoStackIfPossible, completeAutoStackFlight };
}
