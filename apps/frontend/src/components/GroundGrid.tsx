"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Position, Positionable } from "@happy-little-park/utils";
import { useQueryClient } from "@tanstack/react-query";

import { GROUND_GRID_MAX_WIDTH_PX } from "../constants";
import { BEETLE_HOUSE_SPAN, hasBeetleHouse } from "../constants/beetleBuild";
import { queryKeys } from "../constants/queryKeys";
import { useAnonymousId } from "../context/AnonymousIdContext";
import { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { dropAction } from "../domain/drag-n-drop/dropAction";
import { updateBugsCache, useBugsQuery } from "../hooks/useBugs";
import { updateItemsCache, useItemsQuery } from "../hooks/useItems";
import { updateStacksCache, useExtractFromStackMutation, useStacksQuery } from "../hooks/useStacks";
import {
  updateStructuresCache,
  useCreateFirstStructureMutation,
  useCreateStructureMutation,
  useDigMutation,
  useStructuresQuery,
} from "../hooks/useStructures";
import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { isBug, isItem, isStack, isStructure } from "../utils/typeGuards";
import { BeetlePopup } from "./BeetlePopup";
import { BugsProgressLayer } from "./BugsProgressLayer";
import { GridCountersLayer } from "./GridCountersLayer";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";
import { findFirstStructurePlacement } from "./helpers/findFirstStructurePlacement";
import { pickRandomNearestStructureCenterCell } from "./helpers/structureCenterCell";
import { ItemFlightLayer } from "./ItemFlightLayer";
import { StructureBuildProgressLayer } from "./StructureBuildProgressLayer";

interface GroundGridProps {
  rows: number;
  cols: number;
}

export function GroundGrid({ rows, cols }: GroundGridProps) {
  const { anonymousId } = useAnonymousId();
  const queryClient = useQueryClient();
  const isAuthenticated = Boolean(anonymousId);

  const { data: structures = [], isSuccess: structuresLoaded } =
    useStructuresQuery(isAuthenticated);
  const canLoadGridData = isAuthenticated && structures.length > 0;
  const { data: items = [] } = useItemsQuery(canLoadGridData);
  const { data: bugs = [] } = useBugsQuery(canLoadGridData);
  const { data: stacks = [] } = useStacksQuery(canLoadGridData);
  const extractFromStack = useExtractFromStackMutation();
  const dig = useDigMutation();
  const {
    mutate: createFirstStructureMutate,
    isPending: isCreatingFirstStructure,
    isError: firstStructureCreateFailed,
  } = useCreateFirstStructureMutation();
  const createStructure = useCreateStructureMutation();

  const animatables = useMemo(
    () => [...items, ...stacks, ...bugs, ...structures],
    [items, stacks, bugs, structures],
  );

  const [gridDrag, setGridDrag] = useState<DragPayload | null>(null);
  const [selectedBeetle, setSelectedBeetle] = useState<Bug | null>(null);

  useEffect(() => {
    if (
      !structuresLoaded ||
      structures.length > 0 ||
      isCreatingFirstStructure ||
      firstStructureCreateFailed
    ) {
      return;
    }
    createFirstStructureMutate();
  }, [
    structuresLoaded,
    structures.length,
    isCreatingFirstStructure,
    firstStructureCreateFailed,
    createFirstStructureMutate,
  ]);

  const setItemsCache = useCallback(
    (updater: (items: Item[]) => Item[]) => {
      updateItemsCache(queryClient, updater);
    },
    [queryClient],
  );

  const setStacksCache = useCallback(
    (updater: (stacks: Stack[]) => Stack[]) => {
      updateStacksCache(queryClient, updater);
    },
    [queryClient],
  );

  const setBugsCache = useCallback(
    (updater: (bugs: Bug[]) => Bug[]) => {
      updateBugsCache(queryClient, updater);
    },
    [queryClient],
  );

  const setStructuresCache = useCallback(
    (updater: (structures: Structure[]) => Structure[]) => {
      updateStructuresCache(queryClient, updater);
    },
    [queryClient],
  );

  const handleFlightComplete = useCallback(
    (entityId: string) => {
      setItemsCache((prev) =>
        prev.map((item) =>
          item.id === entityId ? { ...item, fromX: undefined, fromY: undefined } : item,
        ),
      );
      setBugsCache((prev) =>
        prev.map((bug) =>
          bug.id === entityId ? { ...bug, fromX: undefined, fromY: undefined } : bug,
        ),
      );
      setStacksCache((prev) =>
        prev.map((stack) =>
          stack.id === entityId ? { ...stack, fromX: undefined, fromY: undefined } : stack,
        ),
      );
      setStructuresCache((prev) =>
        prev.map((structure) =>
          structure.id === entityId
            ? { ...structure, fromX: undefined, fromY: undefined }
            : structure,
        ),
      );
    },
    [setItemsCache, setBugsCache, setStructuresCache, setStacksCache],
  );

  const handleItemDropCancelled = useCallback(
    (itemId: string, position: Position) => {
      setItemsCache((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, fromX: position.x, fromY: position.y } : item,
        ),
      );
      setBugsCache((prev) =>
        prev.map((bug) =>
          bug.id === itemId ? { ...bug, fromX: position.x, fromY: position.y } : bug,
        ),
      );
      setStacksCache((prev) =>
        prev.map((stack) =>
          stack.id === itemId ? { ...stack, fromX: position.x, fromY: position.y } : stack,
        ),
      );
      setStructuresCache((prev) =>
        prev.map((structure) =>
          structure.id === itemId
            ? { ...structure, fromX: position.x, fromY: position.y }
            : structure,
        ),
      );
    },
    [setItemsCache],
  );

  // todo: either { x, y } or targetEntity (or separate handlers)
  const handleItemDropped = useCallback(
    (itemId: string, { x, y }: Position, targetEntity?: Positionable) => {
      (async () => {
        const originalItem = items.find((item) => item.id === itemId);
        const originalStack = stacks.find((stack) => stack.id === itemId);
        const originalBug = bugs.find((bug) => bug.id === itemId);
        const originalStructure = structures.find((structure) => structure.id === itemId);
        const originalEntity = originalItem ?? originalStack ?? originalBug ?? originalStructure;

        if (!originalEntity) {
          console.error("Can't drop the item, could not find entity with id:", itemId);
          return;
        }

        // drop onto an empty position, assume optimistic update
        if (!targetEntity) {
          if (originalItem) {
            setItemsCache((prev) =>
              prev.map((it) => (it.id === originalItem.id ? { ...it, x, y } : it)),
            );
          }
          if (originalStack) {
            setStacksCache((prev) =>
              prev.map((s) => (s.id === originalStack.id ? { ...s, x, y } : s)),
            );
          }
          if (originalBug) {
            setBugsCache((prev) => prev.map((b) => (b.id === originalBug.id ? { ...b, x, y } : b)));
          }
          if (originalStructure) {
            setStructuresCache((prev) =>
              prev.map((s) => (s.id === originalStructure.id ? { ...s, x, y } : s)),
            );
          }
        }

        // drop an item onto a stack to add it to its items, assume optimistic update
        if (originalItem && targetEntity && isStack(targetEntity)) {
          setItemsCache((prev) => prev.filter((it) => it.id !== originalItem.id));
        }

        // drop an item onto a bug to add it to its items, assume optimistic update
        if (originalItem && targetEntity && isBug(targetEntity)) {
          setItemsCache((prev) => prev.filter((it) => it.id !== originalItem.id));
          setBugsCache((prev) =>
            prev.map((bug) =>
              bug.id === targetEntity.id
                ? {
                    ...bug,
                    itemIds: [...bug.itemIds, originalItem.id],
                  }
                : bug,
            ),
          );
        }

        // drop an item onto a structure to add it to its items, assume optimistic update
        if (originalItem && targetEntity && isStructure(targetEntity)) {
          setItemsCache((prev) => prev.filter((it) => it.id !== originalItem.id));
          setStructuresCache((prev) =>
            prev.map((structure) =>
              structure.id === targetEntity.id
                ? {
                    ...structure,
                    items: [
                      ...structure.items,
                      { id: originalItem.id, itemType: originalItem.itemType },
                    ],
                  }
                : structure,
            ),
          );
        }

        // drop a bug onto a structure to add it to its bugs, assume optimistic update
        if (originalBug && targetEntity && isStructure(targetEntity)) {
          setBugsCache((prev) => prev.filter((b) => b.id !== originalBug.id));
          setStructuresCache((prev) =>
            prev.map((structure) =>
              structure.id === targetEntity.id
                ? {
                    ...structure,
                    bugs: [
                      ...(structure.bugs ?? []),
                      { id: originalBug.id, bugType: originalBug.bugType },
                    ],
                  }
                : structure,
            ),
          );
        }

        // drop a stack onto another stack to merge them, assume optimistic update
        if (originalStack && targetEntity && isStack(targetEntity)) {
          setStacksCache((prev) => {
            const source = prev.find((s) => s.id === originalStack.id);
            if (!source) {
              throw new Error("Source stack not found");
            }
            return prev
              .filter((s) => s.id !== originalStack.id)
              .map((s) =>
                s.id === targetEntity.id
                  ? { ...s, itemsCount: s.itemsCount + source.itemsCount }
                  : s,
              );
          });
        }

        const {
          items: newItems,
          stacks: newStacks,
          bugs: newBugs,
          structures: newStructures,
        } = await dropAction(
          { x, y },
          items,
          stacks,
          bugs,
          structures,
          originalEntity,
          targetEntity,
        );

        queryClient.setQueryData(queryKeys.items, newItems);
        queryClient.setQueryData(queryKeys.stacks, newStacks);
        queryClient.setQueryData(queryKeys.bugs, newBugs);
        queryClient.setQueryData(queryKeys.structures, newStructures);
      })();
    },
    [
      items,
      stacks,
      bugs,
      structures,
      queryClient,
      setItemsCache,
      setStacksCache,
      setBugsCache,
      setStructuresCache,
    ],
  );

  const onStackClick = useCallback(
    (stack: Stack) => {
      (async () => {
        await extractFromStack.mutateAsync(stack.id);
      })();
    },
    [extractFromStack],
  );

  const onStructureClick = useCallback(
    (structure: Structure) => {
      if (structure.structureType !== "hole") {
        return;
      }
      (async () => {
        const itemOrBug = await dig.mutateAsync();
        const origin = pickRandomNearestStructureCenterCell(structure);

        if (isItem(itemOrBug)) {
          setItemsCache((prev) => [...prev, { ...itemOrBug, fromX: origin.x, fromY: origin.y }]);
        } else {
          setBugsCache((prev) => [...prev, { ...itemOrBug, fromX: origin.x, fromY: origin.y }]);
        }
      })();
    },
    [dig, setItemsCache, setBugsCache],
  );

  const onBeetleClick = useCallback((bug: Bug) => {
    setSelectedBeetle(bug);
  }, []);

  const onBeetleBuild = useCallback(
    (_structure: Structure) => {
      if (hasBeetleHouse(structures)) {
        return;
      }
      const position = findFirstStructurePlacement(BEETLE_HOUSE_SPAN, cols, rows, [
        ...structures,
        ...items,
        ...stacks,
        ...bugs,
      ]);
      if (!position) {
        return;
      }
      createStructure.mutate({
        structureType: "beetle_house",
        ...position,
      });
      setSelectedBeetle(null);
    },
    [cols, rows, structures, items, stacks, bugs, createStructure],
  );

  return (
    <div
      className="w-full"
      style={{
        containerType: "inline-size",
        maxWidth: GROUND_GRID_MAX_WIDTH_PX,
      }}
    >
      <div
        className="relative w-full"
        style={{
          aspectRatio: `${cols} / ${rows}`,
        }}
      >
        <GroundGridAssetLayer
          cols={cols}
          rows={rows}
          structures={structures}
          items={items}
          stacks={stacks}
          bugs={bugs}
          gridDrag={gridDrag}
        />
        <ItemFlightLayer
          cols={cols}
          rows={rows}
          animatables={animatables}
          onFlightComplete={handleFlightComplete}
        />
        <GridCountersLayer
          cols={cols}
          rows={rows}
          stacks={stacks}
          structures={structures}
          gridDrag={gridDrag}
        />
        <StructureBuildProgressLayer
          cols={cols}
          rows={rows}
          structures={structures}
          gridDrag={gridDrag}
        />
        <BugsProgressLayer cols={cols} rows={rows} bugs={bugs} gridDrag={gridDrag} />
        <GroundGridInteractionLayer
          cols={cols}
          rows={rows}
          structures={structures}
          items={items}
          stacks={stacks}
          bugs={bugs}
          onStructureClick={onStructureClick}
          onStackClick={onStackClick}
          onBeetleClick={onBeetleClick}
          onDragChange={setGridDrag}
          onItemDropCancelled={handleItemDropCancelled}
          onItemDropped={handleItemDropped}
        />
        {selectedBeetle && (
          <BeetlePopup
            beetle={selectedBeetle}
            canBuild={!hasBeetleHouse(structures)}
            onClose={() => setSelectedBeetle(null)}
            onBuild={onBeetleBuild}
          />
        )}
      </div>
    </div>
  );
}
