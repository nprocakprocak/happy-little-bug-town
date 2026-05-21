"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { GROUND_GRID_MAX_WIDTH_PX } from "../constants";
import { queryKeys } from "../constants/queryKeys";
import { useAnonymousId } from "../context/AnonymousIdContext";
import { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { dropAction } from "../domain/drag-n-drop/dropAction";
import { updateItemsCache, useCreateRandomItemMutation, useItemsQuery } from "../hooks/useItems";
import { updateStacksCache, useExtractFromStackMutation, useStacksQuery } from "../hooks/useStacks";
import { useCreateFirstStructureMutation, useStructuresQuery } from "../hooks/useStructures";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { GridCountersLayer } from "./GridCountersLayer";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";
import { pickRandomNearestStructureCenterCell } from "./helpers/structureCenterCell";
import { ItemFlightLayer } from "./ItemFlightLayer";

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
  const { data: stacks = [] } = useStacksQuery(canLoadGridData);
  const extractFromStack = useExtractFromStackMutation();
  const createRandomItem = useCreateRandomItemMutation();
  const {
    mutate: createFirstStructureMutate,
    isPending: isCreatingFirstStructure,
    isError: firstStructureCreateFailed,
  } = useCreateFirstStructureMutation();

  const animatables = useMemo(() => [...items, ...stacks], [items, stacks]);

  const [gridDrag, setGridDrag] = useState<DragPayload | null>(null);

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

  const handleFlightComplete = useCallback(
    (itemId: string) => {
      setItemsCache((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, fromX: undefined, fromY: undefined } : item,
        ),
      );
    },
    [setItemsCache],
  );

  const handleItemDropCancelled = useCallback(
    (itemId: string, dropX: number, dropY: number) => {
      setItemsCache((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, fromX: dropX, fromY: dropY } : item)),
      );
    },
    [setItemsCache],
  );

  const handleItemDropped = useCallback(
    (itemId: string, x: number, y: number, targetItem?: Item, targetStack?: Stack) => {
      (async () => {
        const originalItem = items.find((item) => item.id === itemId);
        const originalStack = stacks.find((stack) => stack.id === itemId);

        if (!originalItem && !originalStack) {
          console.error("Can't drop the item, could not find item or stack with id:", itemId);
          return;
        }

        // drop onto an empty position, assume optimistic update
        if (!targetItem && !targetStack) {
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
        }

        // drop an item onto a stack to add it to its items, assume optimistic update
        if (originalItem && targetStack) {
          setItemsCache((prev) => prev.filter((it) => it.id !== originalItem.id));
        }

        if (originalStack && targetStack) {
          setStacksCache((prev) => {
            const source = prev.find((s) => s.id === originalStack.id);
            if (!source) {
              throw new Error("Source stack not found");
            }
            return prev
              .filter((s) => s.id !== originalStack.id)
              .map((s) =>
                s.id === targetStack.id
                  ? { ...s, itemsCount: s.itemsCount + source.itemsCount }
                  : s,
              );
          });
        }

        const { items: newItems, stacks: newStacks } = await dropAction(
          { x, y },
          items,
          stacks,
          originalItem || originalStack!,
          targetItem || targetStack,
        );

        queryClient.setQueryData(queryKeys.items, newItems);
        queryClient.setQueryData(queryKeys.stacks, newStacks);
      })();
    },
    [items, stacks, queryClient, setItemsCache, setStacksCache],
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
      (async () => {
        try {
          const item = await createRandomItem.mutateAsync();
          const origin = pickRandomNearestStructureCenterCell(structure);

          setItemsCache((prev) => [...prev, { ...item, fromX: origin.x, fromY: origin.y }]);
        } catch (error) {
          // todo: show alert
          console.error("Failed to create random item:", error);
        }
      })();
    },
    [createRandomItem, setItemsCache],
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
          gridDrag={gridDrag}
        />
        <ItemFlightLayer
          cols={cols}
          rows={rows}
          animatables={animatables}
          onFlightComplete={handleFlightComplete}
        />
        <GridCountersLayer cols={cols} rows={rows} stacks={stacks} gridDrag={gridDrag} />
        <GroundGridInteractionLayer
          cols={cols}
          rows={rows}
          structures={structures}
          items={items}
          stacks={stacks}
          onStructureClick={onStructureClick}
          onStackClick={onStackClick}
          onDragChange={setGridDrag}
          onItemDropCancelled={handleItemDropCancelled}
          onItemDropped={handleItemDropped}
        />
      </div>
    </div>
  );
}
