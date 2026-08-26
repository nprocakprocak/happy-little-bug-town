"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canCraftFromStructureOperationalResources,
  canCreateItemType,
  canDiscardBugOnStructure,
  canDiscardItemOnStructure,
  canDropBugOnStack,
  canDropItemOnItem,
  getEvolutionStepFromType,
  getGreenflyHouseOccupants,
  isBuildableStructureType,
  isGroundEvolutionStructureType,
  isStructurePowered,
  isStructureReadyToEvolve,
  ItemType,
  Position,
  Positionable,
  StructureType,
} from "@happy-little-bug-town/utils";
import { useQueryClient } from "@tanstack/react-query";

import { evolveStructure } from "../../api/structures";
import { GROUND_GRID_MAX_WIDTH_PX } from "../../constants";
import { queryKeys } from "../../constants/queryKeys";
import { useAuth } from "../../context/AuthContext";
import { useAutoRouteItems } from "../../hooks/useAutoRouteItems";
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
import { FarmPopup } from "../popups/farm/FarmPopup";
import { GreenflyPopup } from "../popups/greenfly/GreenflyPopup";
import { LadybugPopup } from "../popups/ladybug/LadybugPopup";
import { TermitePopup } from "../popups/termite/TermitePopup";
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
  const {
    autoRouteFlights,
    beginAutoRouteIfPossible,
    beginAutoRouteBugIfPossible,
    completeAutoRouteFlight,
  } = useAutoRouteItems();

  const animatables = useMemo(
    () => [...items, ...autoRouteFlights, ...stacks, ...bugs, ...structures],
    [items, autoRouteFlights, stacks, bugs, structures],
  );

  const [gridDrag, setGridDrag] = useState<DragPayload | null>(null);
  const [selectedBeetle, setSelectedBeetle] = useState<Bug | null>(null);
  const [selectedLadybug, setSelectedLadybug] = useState<Bug | null>(null);
  const [selectedAnt, setSelectedAnt] = useState<Bug | null>(null);
  const [selectedTermite, setSelectedTermite] = useState<Bug | null>(null);
  const [selectedGreenfly, setSelectedGreenfly] = useState<Bug | null>(null);
  const [workshopPopupOpen, setWorkshopPopupOpen] = useState(false);
  const [farmPopupOpen, setFarmPopupOpen] = useState(false);
  const setEvolvingToStructureType = useMainStore((state) => state.setEvolvingToStructureType);

  const beginStructureEvolution = useCallback(
    async (structureId: string, toType: StructureType) => {
      setEvolvingToStructureType(toType);
      updateStructuresCache(queryClient, (prev) =>
        prev.map((structure) =>
          structure.id === structureId ? { ...structure, structureType: toType } : structure,
        ),
      );

      const evolved = await evolveStructure(structureId);
      updateStructuresCache(queryClient, (prev) =>
        prev.map((structure) => (structure.id === evolved.id ? evolved : structure)),
      );
    },
    [queryClient, setEvolvingToStructureType],
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
      if (completeAutoRouteFlight(entityId)) {
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
    [completeAutoRouteFlight, setItemsCache, setBugsCache, setStructuresCache, setStacksCache],
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
          if (!canDiscardBugOnStructure(originalBug, targetEntity)) {
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

        if (
          originalBug &&
          targetEntity &&
          isStructure(targetEntity) &&
          !canDiscardBugOnStructure(originalBug, targetEntity)
        ) {
          const readyStructure = newStructures.find(
            (structure) => structure.id === targetEntity.id && isStructureReadyToEvolve(structure),
          );
          if (readyStructure) {
            const step = getEvolutionStepFromType(readyStructure.structureType);
            if (step) {
              await beginStructureEvolution(readyStructure.id, step.toType);
            }
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
      beginStructureEvolution,
    ],
  );

  const onStackClick = useCallback(
    (stack: Stack) => {
      (async () => {
        const result = await extractFromStack.mutateAsync(stack);
        const latestStructures =
          queryClient.getQueryData<Structure[]>(queryKeys.structures) ?? structures;
        const latestStacks = queryClient.getQueryData<Stack[]>(queryKeys.stacks) ?? stacks;
        const latestItems = queryClient.getQueryData<Item[]>(queryKeys.items) ?? items;

        if (
          !beginAutoRouteIfPossible(
            result.extractedItem,
            { x: stack.x, y: stack.y },
            latestStructures,
            latestStacks,
            latestItems,
            { stackId: stack.id },
          )
        ) {
          setItemsCache((prev) => [
            ...prev,
            {
              ...result.extractedItem,
              fromX: stack.x,
              fromY: stack.y,
            },
          ]);
        }
      })();
    },
    [
      beginAutoRouteIfPossible,
      extractFromStack,
      items,
      queryClient,
      setItemsCache,
      stacks,
      structures,
    ],
  );

  const onStructureClick = useCallback(
    (structure: Structure) => {
      if (isGroundEvolutionStructureType(structure.structureType)) {
        void (async () => {
          const itemOrBug = await digQueue.enqueue(structure.id);
          const origin = pickRandomNearestStructureCenterCell(structure);
          const latestItems = queryClient.getQueryData<Item[]>(queryKeys.items) ?? items;
          const latestStacks = queryClient.getQueryData<Stack[]>(queryKeys.stacks) ?? stacks;
          const latestStructures =
            queryClient.getQueryData<Structure[]>(queryKeys.structures) ?? structures;

          if (isItem(itemOrBug)) {
            if (
              !beginAutoRouteIfPossible(
                itemOrBug,
                origin,
                latestStructures,
                latestStacks,
                latestItems,
                { structureId: structure.id },
              )
            ) {
              setItemsCache((prev) => [
                ...prev,
                { ...itemOrBug, fromX: origin.x, fromY: origin.y },
              ]);
            }
          } else if (
            !beginAutoRouteBugIfPossible(itemOrBug, origin, latestStructures, {
              structureId: structure.id,
            })
          ) {
            setBugsCache((prev) => [...prev, { ...itemOrBug, fromX: origin.x, fromY: origin.y }]);
          }
        })();
        return;
      }

      if (structure.structureType === "workshop" && isStructurePowered(structure)) {
        setWorkshopPopupOpen(true);
        return;
      }

      if (structure.structureType === "farm" && isStructurePowered(structure)) {
        setFarmPopupOpen(true);
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
            const latestStructures =
              queryClient.getQueryData<Structure[]>(queryKeys.structures) ?? structures;

            if (
              !beginAutoRouteBugIfPossible(craftedBug, origin, latestStructures, {
                structureId: structure.id,
              })
            ) {
              setBugsCache((prev) => [
                ...prev,
                { ...craftedBug, fromX: origin.x, fromY: origin.y },
              ]);
            }
            return;
          }
          if (result.item) {
            const craftedItem = result.item;
            const latestStructures =
              queryClient.getQueryData<Structure[]>(queryKeys.structures) ?? structures;
            const latestStacks = queryClient.getQueryData<Stack[]>(queryKeys.stacks) ?? stacks;
            const latestItems = queryClient.getQueryData<Item[]>(queryKeys.items) ?? items;

            if (
              !beginAutoRouteIfPossible(
                craftedItem,
                origin,
                latestStructures,
                latestStacks,
                latestItems,
                { structureId: structure.id },
              )
            ) {
              setItemsCache((prev) => [
                ...prev,
                { ...craftedItem, fromX: origin.x, fromY: origin.y },
              ]);
            }
          }
        })();
        return;
      }

      if (structure.structureType === "beetle_house") {
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
        return;
      }

      if (structure.structureType !== "greenfly_house") {
        return;
      }

      if (
        getGreenflyHouseOccupants(structure).length === 0 ||
        !hasEmptyGridCell(rows, cols, animatables)
      ) {
        return;
      }

      (async () => {
        const result = await extractOccupantMutation.mutateAsync(structure.id);
        const origin = getBeetleHouseExtractOrigin(structure);
        setStructuresCache((prev) =>
          prev.map((s) => (s.id === result.structure.id ? result.structure : s)),
        );
        const latestStructures =
          queryClient.getQueryData<Structure[]>(queryKeys.structures) ?? structures;

        if (
          !beginAutoRouteBugIfPossible(result.extractedOccupant, origin, latestStructures, {
            structureId: structure.id,
            onlyOperational: true,
          })
        ) {
          setBugsCache((prev) => [
            ...prev,
            { ...result.extractedOccupant, fromX: origin.x, fromY: origin.y },
          ]);
        }
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
      structures,
      beginAutoRouteIfPossible,
      beginAutoRouteBugIfPossible,
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

  const onTermiteClick = useCallback((bug: Bug) => {
    setSelectedTermite(bug);
  }, []);

  const onGreenflyClick = useCallback((bug: Bug) => {
    setSelectedGreenfly(bug);
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
      setFarmPopupOpen(false);
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
          onTermiteClick={onTermiteClick}
          onGreenflyClick={onGreenflyClick}
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
        {selectedTermite && (
          <TermitePopup termite={selectedTermite} onClose={() => setSelectedTermite(null)} />
        )}
        {selectedGreenfly && (
          <GreenflyPopup greenfly={selectedGreenfly} onClose={() => setSelectedGreenfly(null)} />
        )}
        {workshopPopupOpen && (
          <WorkshopPopup
            onClose={() => setWorkshopPopupOpen(false)}
            onCreateItem={onWorkshopCreateItem}
            items={items}
            isCreating={createItem.isPending}
          />
        )}
        {farmPopupOpen && (
          <FarmPopup
            structures={structures}
            onClose={() => setFarmPopupOpen(false)}
            onBuild={onBeetleBuild}
          />
        )}
      </div>
    </div>
  );
}
