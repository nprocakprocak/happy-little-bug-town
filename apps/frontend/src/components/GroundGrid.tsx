"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GROUND_GRID_MAX_WIDTH_PX } from "../constants";
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
  useDigMutation,
  useStructuresQuery,
  useUpdateStructurePositionMutation,
} from "../hooks/useStructures";
import { Bug } from "../types/bug";
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
  const { data: bugs = [] } = useBugsQuery(canLoadGridData);
  const { data: stacks = [] } = useStacksQuery(canLoadGridData);
  const extractFromStack = useExtractFromStackMutation();
  const dig = useDigMutation();
  const updateStructurePosition = useUpdateStructurePositionMutation();
  const {
    mutate: createFirstStructureMutate,
    isPending: isCreatingFirstStructure,
    isError: firstStructureCreateFailed,
  } = useCreateFirstStructureMutation();

  const animatables = useMemo(() => [...items, ...stacks, ...bugs], [items, stacks, bugs]);

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

  const setBugsCache = useCallback(
    (updater: (bugs: Bug[]) => Bug[]) => {
      updateBugsCache(queryClient, updater);
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
    },
    [setItemsCache, setBugsCache],
  );

  const handleItemDropCancelled = useCallback(
    (itemId: string, dropX: number, dropY: number) => {
      setItemsCache((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, fromX: dropX, fromY: dropY } : item)),
      );
      setBugsCache((prev) =>
        prev.map((bug) => (bug.id === itemId ? { ...bug, fromX: dropX, fromY: dropY } : bug)),
      );
      setStacksCache((prev) =>
        prev.map((stack) => (stack.id === itemId ? { ...stack, fromX: dropX, fromY: dropY } : stack)),
      );
    },
    [setItemsCache],
  );

  // todo: either { x, y } or targetEntity (or separate handlers)
  const handleItemDropped = useCallback(
    (itemId: string, x: number, y: number, targetItem?: Item, targetStack?: Stack, targetBug?: Bug) => {
      (async () => {
        const originalItem = items.find((item) => item.id === itemId);
        const originalStack = stacks.find((stack) => stack.id === itemId);
        const originalBug = bugs.find((bug) => bug.id === itemId);

        if (!originalItem && !originalStack && !originalBug) {
          console.error("Can't drop the item, could not find entity with id:", itemId);
          return;
        }

        // drop onto an empty position, assume optimistic update
        if (!targetItem && !targetStack && !targetBug) {
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
            setBugsCache((prev) =>
              prev.map((b) => (b.id === originalBug.id ? { ...b, x, y } : b)),
            );
          }
        }

        // drop an item onto a stack to add it to its items, assume optimistic update
        if (originalItem && targetStack) {
          setItemsCache((prev) => prev.filter((it) => it.id !== originalItem.id));
        }

        // drop a stack onto another stack to merge them, assume optimistic update
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
          bugs,
          originalItem || originalStack || originalBug!,
          targetItem || targetStack || targetBug,
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

  const handleStructureDropped = useCallback(
    (structureId: string, x: number, y: number) => {
      (async () => {
        const originalStructure = structures.find((structure) => structure.id === structureId);
        if (!originalStructure) {
          console.error("Can't drop structure, could not find structure with id:", structureId);
          return;
        }

        // optimistic update
        updateStructuresCache(queryClient, (prev) =>
          prev.map((structure) =>
            structure.id === structureId ? { ...structure, x, y } : structure,
          ),
        );

        const structure = await updateStructurePosition.mutateAsync({
          structureId,
          position: { x, y },
        });
        updateStructuresCache(queryClient, (prev) =>
          prev.map((s) => (s.id === structure.id ? structure : s)),
        );
      })();
    },
    [structures, queryClient, updateStructurePosition],
  );

  const onStructureClick = useCallback(
    (structure: Structure) => {
      (async () => {
        const itemOrBug = await dig.mutateAsync();
        const origin = pickRandomNearestStructureCenterCell(structure);

        if ("itemType" in itemOrBug) {
          setItemsCache((prev) => [...prev, { ...itemOrBug, fromX: origin.x, fromY: origin.y }]);
        } else {
          setBugsCache((prev) => [...prev, { ...itemOrBug, fromX: origin.x, fromY: origin.y }]);
        }
      })();
    },
    [dig, setItemsCache, setBugsCache],
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
        <GridCountersLayer cols={cols} rows={rows} stacks={stacks} gridDrag={gridDrag} />
        <GroundGridInteractionLayer
          cols={cols}
          rows={rows}
          structures={structures}
          items={items}
          stacks={stacks}
          bugs={bugs}
          onStructureClick={onStructureClick}
          onStackClick={onStackClick}
          onDragChange={setGridDrag}
          onItemDropCancelled={handleItemDropCancelled}
          onItemDropped={handleItemDropped}
          onStructureDropped={handleStructureDropped}
        />
      </div>
    </div>
  );
}
