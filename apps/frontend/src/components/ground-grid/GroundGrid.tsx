"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canCraftFromStructureOperationalResources,
  canCreateItemType,
  canDiscardItemOnStructure,
  canDropBugOnStack,
  canDropItemOnItem,
  isBuildableStructureType,
  isHoleReadyToBecomeAnthill,
  isStructurePowered,
  ItemType,
  Position,
  Positionable,
} from "@happy-little-bug-town/utils";
import { useQueryClient } from "@tanstack/react-query";

import { transformToAnthill } from "../../api/structures";
import { GROUND_GRID_MAX_WIDTH_PX } from "../../constants";
import { queryKeys } from "../../constants/queryKeys";
import { useAuth } from "../../context/AuthContext";
import { useAutoStackDugItems } from "../../hooks/useAutoStackDugItems";
import { updateBugsCache, useBugsQuery } from "../../hooks/useBugs";
import { updateItemsCache, useCreateItemMutation, useItemsQuery } from "../../hooks/useItems";
import {
  updateStacksCache,
  useExtractFromStackMutation,
  useStacksQuery,
} from "../../hooks/useStacks";
import {
  updateStructuresCache,
  useCraftOperationalResourceMutation,
  useCreateFirstStructureMutation,
  useCreateStructureMutation,
  useExtractOccupantMutation,
  useStructuresQuery,
  useUpgradeStructureMutation,
} from "../../hooks/useStructures";
import { digQueue } from "../../services/digQueue";
import { useMainStore } from "../../stores/main";
import { Bug } from "../../types/bug";
import { DragPayload } from "../../types/dragPayload";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { dropAction } from "../../utils/dropAction";
import { isBug, isItem, isStack, isStructure } from "../../utils/typeGuards";
import { findFirstStructurePlacement } from "../helpers/findFirstStructurePlacement";
import { hasEmptyGridCell } from "../helpers/hasEmptyGridCell";
import {
  getBeetleHouseExtractOrigin,
  pickRandomNearestStructureCenterCell,
} from "../helpers/structureCenterCell";
import { AntPopup } from "../popups/ant/AntPopup";
import { BeetlePopup } from "../popups/beetle/BeetlePopup";
import { LadybugPopup } from "../popups/ladybug/LadybugPopup";
import { WorkshopPopup } from "../popups/workshop/WorkshopPopup";
import { BugsProgressLayer } from "./BugsProgressLayer";
import { GridCountersLayer } from "./GridCountersLayer";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";
import { ItemCraftProgressLayer } from "./ItemCraftProgressLayer";
import { ItemFlightLayer } from "./ItemFlightLayer";
import { StructureBuildProgressLayer } from "./StructureBuildProgressLayer";
import { StructurePowerProgressLayer } from "./StructurePowerProgressLayer";
import { StructureResourceProgressLayer } from "./StructureResourceProgressLayer";

interface GroundGridProps {
  rows: number;
  cols: number;
}

export function GroundGrid({ rows, cols }: GroundGridProps) {
  const { anonymousId } = useAuth();
  const queryClient = useQueryClient();
  const isAuthenticated = Boolean(anonymousId);

  const { data: structures = [], isSuccess: structuresLoaded } =
    useStructuresQuery(isAuthenticated);
  const canLoadGridData = isAuthenticated && structures.length > 0;
  const { data: items = [] } = useItemsQuery(canLoadGridData);
  const { data: bugs = [] } = useBugsQuery(canLoadGridData);
  const { data: stacks = [] } = useStacksQuery(canLoadGridData);
  const extractFromStack = useExtractFromStackMutation();
  const extractOccupantMutation = useExtractOccupantMutation();
  const craftOperationalResourceMutation = useCraftOperationalResourceMutation();
  const {
    mutate: createFirstStructureMutate,
    isPending: isCreatingFirstStructure,
    isError: firstStructureCreateFailed,
  } = useCreateFirstStructureMutation();
  const createStructure = useCreateStructureMutation();
  const upgradeStructureMutation = useUpgradeStructureMutation();
  const createItem = useCreateItemMutation();
  const { autoStackFlights, beginAutoStackIfPossible, completeAutoStackFlight } =
    useAutoStackDugItems();

  const animatables = useMemo(
    () => [...items, ...autoStackFlights, ...stacks, ...bugs, ...structures],
    [items, autoStackFlights, stacks, bugs, structures],
  );

  const [gridDrag, setGridDrag] = useState<DragPayload | null>(null);
  const [selectedBeetle, setSelectedBeetle] = useState<Bug | null>(null);
  const [selectedLadybug, setSelectedLadybug] = useState<Bug | null>(null);
  const [selectedAnt, setSelectedAnt] = useState<Bug | null>(null);
  const [workshopPopupOpen, setWorkshopPopupOpen] = useState(false);
  const [preferSandySoilBackground, setPreferSandySoilBackground] = useState(false);
  const isTransformingToAnthill = useMainStore((state) => state.isTransformingToAnthill);
  const setIsTransformingToAnthill = useMainStore((state) => state.setIsTransformingToAnthill);

  const hasAnthill = structures.some((structure) => structure.structureType === "anthill");
  const useSandySoilBackground = preferSandySoilBackground || hasAnthill;

  const beginHoleToAnthillTransform = useCallback(
    async (holeId: string) => {
      setPreferSandySoilBackground(true);
      setIsTransformingToAnthill(true);
      updateStructuresCache(queryClient, (prev) =>
        prev.map((structure) =>
          structure.id === holeId ? { ...structure, structureType: "anthill" } : structure,
        ),
      );

      const anthill = await transformToAnthill();
      updateStructuresCache(queryClient, (prev) =>
        prev.map((structure) => (structure.id === anthill.id ? anthill : structure)),
      );
    },
    [queryClient, setIsTransformingToAnthill],
  );

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
      if (completeAutoStackFlight(entityId)) {
        return;
      }

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
    [completeAutoStackFlight, setItemsCache, setBugsCache, setStructuresCache, setStacksCache],
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
    [setItemsCache, setBugsCache, setStacksCache, setStructuresCache],
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
                    items: [...bug.items, { id: originalItem.id, itemType: originalItem.itemType }],
                  }
                : bug,
            ),
          );
        }

        // drop an item onto a structure to add it to its items or build it, assume optimistic update
        if (originalItem && targetEntity && isStructure(targetEntity)) {
          setItemsCache((prev) => prev.filter((it) => it.id !== originalItem.id));
          if (!canDiscardItemOnStructure(targetEntity)) {
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
        }

        // drop an item onto another item to craft it, assume optimistic update
        if (
          originalItem &&
          targetEntity &&
          isItem(targetEntity) &&
          canDropItemOnItem(originalItem, targetEntity)
        ) {
          setItemsCache((prev) =>
            prev
              .filter((it) => it.id !== originalItem.id)
              .map((it) =>
                it.id === targetEntity.id
                  ? {
                      ...it,
                      items: [
                        ...it.items,
                        { id: originalItem.id, itemType: originalItem.itemType },
                      ],
                    }
                  : it,
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

        // drop a bug onto a stack to assign it, assume optimistic update
        if (originalBug && targetEntity && isStack(targetEntity)) {
          setBugsCache((prev) => prev.filter((b) => b.id !== originalBug.id));
          setStacksCache((prev) =>
            prev.map((s) =>
              s.id === targetEntity.id
                ? {
                    ...s,
                    bugs: [...(s.bugs ?? []), { id: originalBug.id, bugType: originalBug.bugType }],
                  }
                : s,
            ),
          );
        }

        // drop a stack onto another stack to merge them, assume optimistic update
        if (originalStack && targetEntity && isStack(targetEntity)) {
          const sourceBugs = originalStack.bugs ?? [];
          const canTransferSourceBugs =
            sourceBugs.length === 1 && canDropBugOnStack(sourceBugs[0], targetEntity);
          const shouldDropSourceBugs = sourceBugs.length > 0 && !canTransferSourceBugs;
          setStacksCache((prev) => {
            const source = prev.find((s) => s.id === originalStack.id);
            if (!source) {
              throw new Error("Source stack not found");
            }
            return prev
              .filter((s) => s.id !== originalStack.id)
              .map((s) =>
                s.id === targetEntity.id
                  ? {
                      ...s,
                      itemsCount: s.itemsCount + source.itemsCount,
                      bugs: canTransferSourceBugs
                        ? [...(s.bugs ?? []), ...sourceBugs]
                        : (s.bugs ?? []),
                    }
                  : s,
              );
          });
          if (shouldDropSourceBugs) {
            setBugsCache((prev) => [
              ...prev,
              ...sourceBugs.map((bug) => ({
                id: bug.id,
                bugType: bug.bugType,
                x: originalStack.x,
                y: originalStack.y,
                fromX: targetEntity.x,
                fromY: targetEntity.y,
                items: [],
              })),
            ]);
          }
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

        if (originalBug && targetEntity && isStructure(targetEntity)) {
          const filledHole = newStructures.find(
            (structure) =>
              structure.id === targetEntity.id && isHoleReadyToBecomeAnthill(structure),
          );
          if (filledHole) {
            await beginHoleToAnthillTransform(filledHole.id);
          }
        }
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
      beginHoleToAnthillTransform,
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
      if (structure.structureType === "hole" || structure.structureType === "anthill") {
        void (async () => {
          const itemOrBug = await digQueue.enqueue(structure.id);
          const origin = pickRandomNearestStructureCenterCell(structure);
          const latestItems = queryClient.getQueryData<Item[]>(queryKeys.items) ?? items;
          const latestStacks = queryClient.getQueryData<Stack[]>(queryKeys.stacks) ?? stacks;

          if (isItem(itemOrBug)) {
            if (!beginAutoStackIfPossible(itemOrBug, origin, latestStacks, latestItems)) {
              setItemsCache((prev) => [
                ...prev,
                { ...itemOrBug, fromX: origin.x, fromY: origin.y },
              ]);
            }
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

      if (canCraftFromStructureOperationalResources(structure)) {
        if (!hasEmptyGridCell(rows, cols, animatables)) {
          return;
        }

        (async () => {
          const result = await craftOperationalResourceMutation.mutateAsync(structure.id);
          const origin = pickRandomNearestStructureCenterCell(structure);
          setStructuresCache((prev) =>
            prev.map((s) => (s.id === result.structure.id ? result.structure : s)),
          );
          if (result.bug) {
            const craftedBug = result.bug;
            setBugsCache((prev) => [...prev, { ...craftedBug, fromX: origin.x, fromY: origin.y }]);
            return;
          }
          if (result.item) {
            const craftedItem = result.item;
            setItemsCache((prev) => [
              ...prev,
              { ...craftedItem, fromX: origin.x, fromY: origin.y },
            ]);
          }
        })();
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
      queryClient,
      craftOperationalResourceMutation,
      extractOccupantMutation,
      animatables,
      rows,
      cols,
      stacks,
      items,
      beginAutoStackIfPossible,
      setItemsCache,
      setBugsCache,
      setStructuresCache,
    ],
  );

  const onBeetleClick = useCallback((bug: Bug) => {
    setSelectedBeetle(bug);
  }, []);

  const onLadybugClick = useCallback((bug: Bug) => {
    setSelectedLadybug(bug);
  }, []);

  const onAntClick = useCallback((bug: Bug) => {
    setSelectedAnt(bug);
  }, []);

  const onBeetleBuild = useCallback(
    (structure: Structure) => {
      if (!isBuildableStructureType(structure.structureType)) {
        return;
      }
      const position = findFirstStructurePlacement(
        { structureType: structure.structureType },
        cols,
        rows,
        [...structures, ...items, ...stacks, ...bugs],
      );
      if (!position) {
        return;
      }
      createStructure.mutate({
        structureType: structure.structureType,
        ...position,
      });
      setSelectedBeetle(null);
    },
    [cols, rows, structures, items, stacks, bugs, createStructure],
  );

  const onLadybugUpgrade = useCallback(
    (structure: Structure) => {
      upgradeStructureMutation.mutate(structure);
      setSelectedLadybug(null);
    },
    [upgradeStructureMutation],
  );

  const onWorkshopCreateItem = useCallback(
    (itemType: ItemType) => {
      if (!canCreateItemType(items, itemType)) {
        return;
      }
      const position = findFirstStructurePlacement({ itemType }, cols, rows, [
        ...structures,
        ...items,
        ...stacks,
        ...bugs,
      ]);
      if (!position) {
        return;
      }
      createItem.mutate(
        { itemType, ...position },
        {
          onSuccess: () => setWorkshopPopupOpen(false),
        },
      );
    },
    [cols, rows, structures, items, stacks, bugs, createItem],
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
          useSandySoilBackground={useSandySoilBackground}
          isTransformingToAnthill={isTransformingToAnthill}
          onAnthillTransformFadeComplete={() => setIsTransformingToAnthill(false)}
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
        <ItemCraftProgressLayer cols={cols} rows={rows} items={items} gridDrag={gridDrag} />
        <BugsProgressLayer cols={cols} rows={rows} bugs={bugs} gridDrag={gridDrag} />
        <StructureResourceProgressLayer
          cols={cols}
          rows={rows}
          structures={structures}
          gridDrag={gridDrag}
        />
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
          onLadybugClick={onLadybugClick}
          onAntClick={onAntClick}
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
        {selectedLadybug && (
          <LadybugPopup
            ladybug={selectedLadybug}
            structures={structures}
            onClose={() => setSelectedLadybug(null)}
            onUpgrade={onLadybugUpgrade}
          />
        )}
        {selectedAnt && <AntPopup ant={selectedAnt} onClose={() => setSelectedAnt(null)} />}
        {workshopPopupOpen && (
          <WorkshopPopup
            onClose={() => setWorkshopPopupOpen(false)}
            onCreateItem={onWorkshopCreateItem}
            items={items}
            isCreating={createItem.isPending}
          />
        )}
      </div>
    </div>
  );
}
