import { useCallback, useRef, useState } from "react";
import { Position } from "@happy-little-bug-town/utils";
import { useQueryClient } from "@tanstack/react-query";

import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { findAutoRouteTarget, structuresWithPendingAutoRoutes } from "../utils/findAutoRouteTarget";
import { useAddItemToStackMutation, useAddItemToStructureMutation } from "./useItems";
import { updateStacksCache } from "./useStacks";
import { updateStructuresCache } from "./useStructures";

interface PendingAutoRoute {
  target: NonNullable<ReturnType<typeof findAutoRouteTarget>>;
  item: Item;
}

interface AutoRouteExclude {
  structureId?: string;
  stackId?: string;
}

export function useAutoRouteItems() {
  const queryClient = useQueryClient();
  const addItemToStackMutation = useAddItemToStackMutation();
  const addItemToStructureMutation = useAddItemToStructureMutation();
  const [autoRouteFlights, setAutoRouteFlights] = useState<Item[]>([]);
  const pendingByItemIdRef = useRef(new Map<string, PendingAutoRoute>());

  const beginAutoRouteIfPossible = useCallback(
    (
      item: Item,
      origin: Position,
      structures: Structure[],
      stacks: Stack[],
      gridItems: Item[],
      exclude?: AutoRouteExclude,
    ): boolean => {
      const structuresConsideringPending = structuresWithPendingAutoRoutes(
        structures,
        [...pendingByItemIdRef.current.values()].flatMap((pending) =>
          pending.target.kind === "structure"
            ? [
                {
                  structureId: pending.target.structureId,
                  id: pending.item.id,
                  itemType: pending.item.itemType,
                },
              ]
            : [],
        ),
      );
      const target = findAutoRouteTarget(
        item.itemType,
        structuresConsideringPending,
        stacks,
        gridItems,
        origin,
        exclude,
      );
      if (!target) {
        return false;
      }

      pendingByItemIdRef.current.set(item.id, { target, item });
      setAutoRouteFlights((prev) => [
        ...prev,
        {
          ...item,
          x: target.x,
          y: target.y,
          fromX: origin.x,
          fromY: origin.y,
        },
      ]);
      return true;
    },
    [],
  );

  const completeAutoRouteFlight = useCallback(
    (entityId: string): boolean => {
      const pending = pendingByItemIdRef.current.get(entityId);
      if (!pending) {
        return false;
      }

      pendingByItemIdRef.current.delete(entityId);
      setAutoRouteFlights((prev) => prev.filter((item) => item.id !== entityId));

      const { target } = pending;
      if (target.kind === "structure") {
        updateStructuresCache(queryClient, (structures) =>
          structures.map((structure) =>
            structure.id === target.structureId
              ? {
                  ...structure,
                  items: [
                    ...structure.items,
                    { id: pending.item.id, itemType: pending.item.itemType },
                  ],
                }
              : structure,
          ),
        );
        addItemToStructureMutation.mutate({
          itemId: entityId,
          structureId: target.structureId,
        });
        return true;
      }

      updateStacksCache(queryClient, (stacks) =>
        stacks.map((stack) =>
          stack.id === target.stackId ? { ...stack, itemsCount: stack.itemsCount + 1 } : stack,
        ),
      );
      addItemToStackMutation.mutate({
        itemId: entityId,
        stackId: target.stackId,
      });
      return true;
    },
    [addItemToStackMutation, addItemToStructureMutation, queryClient],
  );

  return { autoRouteFlights, beginAutoRouteIfPossible, completeAutoRouteFlight };
}
