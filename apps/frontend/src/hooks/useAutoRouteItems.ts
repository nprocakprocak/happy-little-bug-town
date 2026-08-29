import { useCallback, useRef, useState } from "react";
import { Position } from "@happy-little-bug-town/utils";
import { useQueryClient } from "@tanstack/react-query";

import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import {
  findAutoRouteBugTarget,
  findAutoRouteTarget,
  structuresWithPendingAutoRoutes,
} from "../utils/autoRoute";
import { useAddBeetleToStructureMutation } from "./useBugs";
import { useAddItemToStackMutation, useAddItemToStructureMutation } from "./useItems";
import { updateStacksCache } from "./useStacks";
import { updateStructuresCache } from "./useStructures";

type AutoRouteFlight = Item | Bug;

interface PendingItemAutoRoute {
  entityKind: "item";
  target: NonNullable<ReturnType<typeof findAutoRouteTarget>>;
  item: Item;
}

interface PendingBugAutoRoute {
  entityKind: "bug";
  target: NonNullable<ReturnType<typeof findAutoRouteBugTarget>>;
  bug: Bug;
}

type PendingAutoRoute = PendingItemAutoRoute | PendingBugAutoRoute;

interface AutoRouteExclude {
  structureId?: string;
  stackId?: string;
  onlyOperational?: boolean;
}

function getPendingStructureItems(pending: PendingAutoRoute[]) {
  return pending.flatMap((entry) =>
    entry.entityKind === "item" && entry.target.kind === "structure"
      ? [
          {
            structureId: entry.target.structureId,
            id: entry.item.id,
            itemType: entry.item.itemType,
          },
        ]
      : [],
  );
}

function getPendingStructureBugs(pending: PendingAutoRoute[]) {
  return pending.flatMap((entry) =>
    entry.entityKind === "bug"
      ? [
          {
            structureId: entry.target.structureId,
            id: entry.bug.id,
            bugType: entry.bug.bugType,
          },
        ]
      : [],
  );
}

export function useAutoRouteItems() {
  const queryClient = useQueryClient();
  const addItemToStackMutation = useAddItemToStackMutation();
  const addItemToStructureMutation = useAddItemToStructureMutation();
  const addBeetleToStructureMutation = useAddBeetleToStructureMutation();
  const [autoRouteFlights, setAutoRouteFlights] = useState<AutoRouteFlight[]>([]);
  const pendingByEntityIdRef = useRef(new Map<string, PendingAutoRoute>());

  const beginAutoRouteIfPossible = useCallback(
    (
      item: Item,
      origin: Position,
      structures: Structure[],
      stacks: Stack[],
      gridItems: Item[],
      exclude?: AutoRouteExclude,
    ): boolean => {
      const pending = [...pendingByEntityIdRef.current.values()];
      const structuresConsideringPending = structuresWithPendingAutoRoutes(
        structures,
        getPendingStructureItems(pending),
        getPendingStructureBugs(pending),
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

      pendingByEntityIdRef.current.set(item.id, { entityKind: "item", target, item });
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

  const beginAutoRouteBugIfPossible = useCallback(
    (bug: Bug, origin: Position, structures: Structure[], exclude?: AutoRouteExclude): boolean => {
      const pending = [...pendingByEntityIdRef.current.values()];
      const structuresConsideringPending = structuresWithPendingAutoRoutes(
        structures,
        getPendingStructureItems(pending),
        getPendingStructureBugs(pending),
      );
      const target = findAutoRouteBugTarget(bug, structuresConsideringPending, origin, exclude);
      if (!target) {
        return false;
      }

      pendingByEntityIdRef.current.set(bug.id, { entityKind: "bug", target, bug });
      setAutoRouteFlights((prev) => [
        ...prev,
        {
          ...bug,
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
      const pending = pendingByEntityIdRef.current.get(entityId);
      if (!pending) {
        return false;
      }

      pendingByEntityIdRef.current.delete(entityId);
      setAutoRouteFlights((prev) => prev.filter((flight) => flight.id !== entityId));

      if (pending.entityKind === "bug") {
        updateStructuresCache(queryClient, (structures) =>
          structures.map((structure) =>
            structure.id === pending.target.structureId
              ? {
                  ...structure,
                  bugs: [...structure.bugs, { id: pending.bug.id, bugType: pending.bug.bugType }],
                }
              : structure,
          ),
        );
        addBeetleToStructureMutation.mutate({
          bugId: entityId,
          structureId: pending.target.structureId,
        });
        return true;
      }

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
    [addBeetleToStructureMutation, addItemToStackMutation, addItemToStructureMutation, queryClient],
  );

  return {
    autoRouteFlights,
    beginAutoRouteIfPossible,
    beginAutoRouteBugIfPossible,
    completeAutoRouteFlight,
  };
}
