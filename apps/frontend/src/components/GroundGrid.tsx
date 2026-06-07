"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canCreateToolType,
  getStructureSpan,
  getToolSpan,
  isBuildableStructureType,
  isStructurePowered,
  Position,
  Positionable,
  ToolType,
} from "@happy-little-park/utils";
import { useQueryClient } from "@tanstack/react-query";

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
  useCreateStructureMutation,
  useDigMutation,
  useExtractOccupantMutation,
  useStructuresQuery,
} from "../hooks/useStructures";
import { updateToolsCache, useCreateToolMutation, useToolsQuery } from "../hooks/useTools";
import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { Tool } from "../types/tool";
import { isBug, isItem, isStack, isStructure, isTool } from "../utils/typeGuards";
import { BeetlePopup } from "./BeetlePopup";
import { BugsProgressLayer } from "./BugsProgressLayer";
import { GridCountersLayer } from "./GridCountersLayer";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";
import { findFirstStructurePlacement } from "./helpers/findFirstStructurePlacement";
import { hasEmptyGridCell } from "./helpers/hasEmptyGridCell";
import {
  getBeetleHouseExtractOrigin,
  pickRandomNearestStructureCenterCell,
} from "./helpers/structureCenterCell";
import { ItemFlightLayer } from "./ItemFlightLayer";
import { StructureBuildProgressLayer } from "./StructureBuildProgressLayer";
import { StructurePowerProgressLayer } from "./StructurePowerProgressLayer";
import { ToolCraftProgressLayer } from "./ToolCraftProgressLayer";
import { WorkshopPopup } from "./WorkshopPopup";

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
  const { data: tools = [] } = useToolsQuery(canLoadGridData);
  const extractFromStack = useExtractFromStackMutation();
  const dig = useDigMutation();
  const extractOccupantMutation = useExtractOccupantMutation();
  const {
    mutate: createFirstStructureMutate,
    isPending: isCreatingFirstStructure,
    isError: firstStructureCreateFailed,
  } = useCreateFirstStructureMutation();
  const createStructure = useCreateStructureMutation();
  const createTool = useCreateToolMutation();

  const animatables = useMemo(
    () => [...items, ...stacks, ...bugs, ...structures, ...tools],
    [items, stacks, bugs, structures, tools],
  );

  const [gridDrag, setGridDrag] = useState<DragPayload | null>(null);
  const [selectedBeetle, setSelectedBeetle] = useState<Bug | null>(null);
  const [workshopPopupOpen, setWorkshopPopupOpen] = useState(false);

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

  const setToolsCache = useCallback(
    (updater: (tools: Tool[]) => Tool[]) => {
      updateToolsCache(queryClient, updater);
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
      setToolsCache((prev) =>
        prev.map((tool) =>
          tool.id === entityId ? { ...tool, fromX: undefined, fromY: undefined } : tool,
        ),
      );
    },
    [setItemsCache, setBugsCache, setStructuresCache, setStacksCache, setToolsCache],
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
      setToolsCache((prev) =>
        prev.map((tool) =>
          tool.id === itemId ? { ...tool, fromX: position.x, fromY: position.y } : tool,
        ),
      );
    },
    [setItemsCache, setBugsCache, setStacksCache, setStructuresCache, setToolsCache],
  );

  // todo: either { x, y } or targetEntity (or separate handlers)
  const handleItemDropped = useCallback(
    (itemId: string, { x, y }: Position, targetEntity?: Positionable) => {
      (async () => {
        const originalItem = items.find((item) => item.id === itemId);
        const originalStack = stacks.find((stack) => stack.id === itemId);
        const originalBug = bugs.find((bug) => bug.id === itemId);
        const originalStructure = structures.find((structure) => structure.id === itemId);
        const originalTool = tools.find((tool) => tool.id === itemId);
        const originalEntity =
          originalItem ?? originalStack ?? originalBug ?? originalStructure ?? originalTool;

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
          if (originalTool) {
            setToolsCache((prev) =>
              prev.map((t) => (t.id === originalTool.id ? { ...t, x, y } : t)),
            );
          }
        }

        // drop an item onto a stack to add it to its items, assume optimistic update
        if (originalItem && targetEntity && isStack(targetEntity)) {
          setItemsCache((prev) => prev.filter((it) => it.id !== originalItem.id));
          setStacksCache((prev) =>
            prev.map((s) =>
              s.id === targetEntity.id ? { ...s, itemsCount: s.itemsCount + 1 } : s,
            ),
          );
        }

        // drop an item onto a bug to feed it, assume optimistic update
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

        // drop an item onto a structure to add it to its items or build it, assume optimistic update
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

        // drop an item onto a tool to craft it, assume optimistic update
        if (originalItem && targetEntity && isTool(targetEntity)) {
          setItemsCache((prev) => prev.filter((it) => it.id !== originalItem.id));
          setToolsCache((prev) =>
            prev.map((tool) =>
              tool.id === targetEntity.id
                ? {
                    ...tool,
                    items: [
                      ...tool.items,
                      { id: originalItem.id, itemType: originalItem.itemType },
                    ],
                  }
                : tool,
            ),
          );
        }

        // drop a bug onto a structure to add it to its workforce, assume optimistic update
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

        // drop a tool onto a structure to add it to its tools, assume optimistic update
        if (originalTool && targetEntity && isStructure(targetEntity)) {
          setToolsCache((prev) => prev.filter((t) => t.id !== originalTool.id));
          setStructuresCache((prev) =>
            prev.map((structure) =>
              structure.id === targetEntity.id
                ? {
                    ...structure,
                    tools: [
                      ...(structure.tools ?? []),
                      { id: originalTool.id, toolType: originalTool.toolType },
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
          tools: newTools,
        } = await dropAction(
          { x, y },
          items,
          stacks,
          bugs,
          structures,
          tools,
          originalEntity,
          targetEntity,
        );

        queryClient.setQueryData(queryKeys.items, newItems);
        queryClient.setQueryData(queryKeys.stacks, newStacks);
        queryClient.setQueryData(queryKeys.bugs, newBugs);
        queryClient.setQueryData(queryKeys.structures, newStructures);
        queryClient.setQueryData(queryKeys.tools, newTools);
      })();
    },
    [
      items,
      stacks,
      bugs,
      structures,
      tools,
      queryClient,
      setItemsCache,
      setStacksCache,
      setBugsCache,
      setStructuresCache,
      setToolsCache,
    ],
  );

  const onStackClick = useCallback(
    (stack: Stack) => {
      (async () => {
        await extractFromStack.mutateAsync(stack);
      })();
    },
    [extractFromStack],
  );

  const onStructureClick = useCallback(
    (structure: Structure) => {
      if (structure.structureType === "hole") {
        (async () => {
          const itemOrBug = await dig.mutateAsync();
          const origin = pickRandomNearestStructureCenterCell(structure);

          if (isItem(itemOrBug)) {
            setItemsCache((prev) => [...prev, { ...itemOrBug, fromX: origin.x, fromY: origin.y }]);
          } else {
            setBugsCache((prev) => [...prev, { ...itemOrBug, fromX: origin.x, fromY: origin.y }]);
          }
        })();
        return;
      }

      if (structure.structureType === "workshop" && isStructurePowered(structure)) {
        setWorkshopPopupOpen(true);
        return;
      }

      if (structure.structureType !== "beetle_house") {
        return;
      }

      if ((structure.bugs ?? []).length === 0 || !hasEmptyGridCell(rows, cols, animatables)) {
        return;
      }

      (async () => {
        const result = await extractOccupantMutation.mutateAsync(structure.id);
        const origin = getBeetleHouseExtractOrigin(structure);
        setStructuresCache((prev) =>
          prev.map((s) => (s.id === result.structure.id ? result.structure : s)),
        );
        setBugsCache((prev) => [
          ...prev,
          { ...result.extractedOccupant, fromX: origin.x, fromY: origin.y },
        ]);
      })();
    },
    [
      dig,
      extractOccupantMutation,
      animatables,
      rows,
      cols,
      setItemsCache,
      setBugsCache,
      setStructuresCache,
    ],
  );

  const onBeetleClick = useCallback((bug: Bug) => {
    setSelectedBeetle(bug);
  }, []);

  const onBeetleBuild = useCallback(
    (structure: Structure) => {
      if (!isBuildableStructureType(structure.structureType)) {
        return;
      }
      const span = getStructureSpan(structure.structureType);
      const position = findFirstStructurePlacement(span, cols, rows, [
        ...structures,
        ...items,
        ...stacks,
        ...bugs,
        ...tools,
      ]);
      if (!position) {
        return;
      }
      createStructure.mutate({
        structureType: structure.structureType,
        ...position,
      });
      setSelectedBeetle(null);
    },
    [cols, rows, structures, items, stacks, bugs, tools, createStructure],
  );

  const onWorkshopCreateTool = useCallback(
    (toolType: ToolType) => {
      if (!canCreateToolType(tools, toolType)) {
        return;
      }
      const span = getToolSpan(toolType);
      const position = findFirstStructurePlacement(span, cols, rows, [
        ...structures,
        ...items,
        ...stacks,
        ...bugs,
        ...tools,
      ]);
      if (!position) {
        return;
      }
      createTool.mutate(
        { toolType, ...position },
        {
          onSuccess: () => setWorkshopPopupOpen(false),
        },
      );
    },
    [cols, rows, structures, items, stacks, bugs, tools, createTool],
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
          tools={tools}
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
        <StructurePowerProgressLayer
          cols={cols}
          rows={rows}
          structures={structures}
          gridDrag={gridDrag}
        />
        <ToolCraftProgressLayer cols={cols} rows={rows} tools={tools} gridDrag={gridDrag} />
        <BugsProgressLayer cols={cols} rows={rows} bugs={bugs} gridDrag={gridDrag} />
        <GroundGridInteractionLayer
          cols={cols}
          rows={rows}
          structures={structures}
          items={items}
          stacks={stacks}
          bugs={bugs}
          tools={tools}
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
            structures={structures}
            onClose={() => setSelectedBeetle(null)}
            onBuild={onBeetleBuild}
          />
        )}
        {workshopPopupOpen && (
          <WorkshopPopup
            onClose={() => setWorkshopPopupOpen(false)}
            onCreateTool={onWorkshopCreateTool}
            tools={tools}
            isCreating={createTool.isPending}
          />
        )}
      </div>
    </div>
  );
}
