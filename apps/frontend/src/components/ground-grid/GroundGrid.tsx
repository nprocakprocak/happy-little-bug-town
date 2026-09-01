"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canCraftFromStructureOperationalResources,
  canCreateItemType,
  canDemolishStructureType,
  canDigAtStructureType,
  findFirstStructurePlacement,
  getCompletedUpgradeLevel,
  getGreenflyHouseOccupants,
  getHouseOccupants,
  hasEmptyGridCell,
  isBugFed,
  isBuildableStructureType,
  isItemCrafted,
  isStructurePowered,
  isWorkshopItemUnlocked,
  ItemType,
  Position,
  StructureType,
} from "@happy-little-bug-town/utils";
import { useQueryClient } from "@tanstack/react-query";

import { GROUND_GRID_MAX_WIDTH_PX } from "../../constants/layout";
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
import { demolishQueue } from "../../services/demolishQueue";
import { digQueue } from "../../services/digQueue";
import { useMainStore } from "../../stores/main";
import { Bug } from "../../types/bug";
import { GridEntity } from "../../types/gridEntity";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { dropAction } from "../helpers/dropAction";
import { shouldCancelDrop } from "../helpers/pointerUp/shouldCancelDrop";
import {
  getBeetleHouseExtractOrigin,
  pickRandomNearestStructureCenterCell,
} from "../helpers/structurePosition";
import { isBug, isItem, isStack, isStructure } from "../helpers/typeGuards";
import { BugPopups } from "../popups/BugPopups";
import { FarmPopup } from "../popups/farm/FarmPopup";
import { HouseOccupiedPopup } from "../popups/house/HouseOccupiedPopup";
import { WorkshopPopup } from "../popups/workshop/WorkshopPopup";
import { DragPayload } from "../types/dragPayload";
import { BugsProgressLayer } from "./BugsProgressLayer";
import { GridCountersLayer } from "./GridCountersLayer";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";
import { ItemCraftProgressLayer } from "./ItemCraftProgressLayer";
import { ItemFlightLayer } from "./ItemFlightLayer";
import { StackCreateBlockedHintLayer } from "./StackCreateBlockedHintLayer";
import { StructureBuildProgressLayer } from "./StructureBuildProgressLayer";
import { StructureDemolishHighlightLayer } from "./StructureDemolishHighlightLayer";
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

  const entities = useMemo(
    () => [...structures, ...items, ...stacks, ...bugs],
    [structures, items, stacks, bugs],
  );
  const animatables = useMemo(
    () => [...entities, ...autoRouteFlights],
    [entities, autoRouteFlights],
  );
  const workshopUpgradeLevel = useMemo(() => {
    const workshop = structures.find((structure) => structure.structureType === "workshop");
    return workshop ? getCompletedUpgradeLevel(workshop) : 0;
  }, [structures]);

  const [gridDrag, setGridDrag] = useState<DragPayload | null>(null);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [workshopPopupOpen, setWorkshopPopupOpen] = useState(false);
  const [farmPopupOpen, setFarmPopupOpen] = useState(false);
  const [occupiedHouseType, setOccupiedHouseType] = useState<StructureType | null>(null);
  const [blockedStackHint, setBlockedStackHint] = useState<{
    origin: Position;
    nonce: number;
  } | null>(null);
  const isDemolishMode = useMainStore((state) => state.isDemolishMode);
  const setIsDemolishMode = useMainStore((state) => state.setIsDemolishMode);

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

  useEffect(() => {
    if (!isDemolishMode) {
      setOccupiedHouseType(null);
    }
  }, [isDemolishMode]);

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

  const handleEntityDropped = useCallback(
    (entityToDrop: GridEntity, dropPosition: Position, targetEntity?: GridEntity) => {
      void (async () => {
        const cancelReason = shouldCancelDrop({
          entityToDrop,
          targetEntity,
          dropPosition,
          items,
          cols,
          rows,
          entities,
        });

        if (cancelReason === "hungryBug" && isBug(entityToDrop)) {
          setSelectedBug(entityToDrop);
        }

        if (cancelReason === "stackCreateBlocked") {
          setBlockedStackHint((prev) => ({
            origin: dropPosition,
            nonce: (prev?.nonce ?? 0) + 1,
          }));
        }

        if (cancelReason) {
          handleItemDropCancelled(entityToDrop.id, dropPosition);
          return;
        }

        await dropAction(
          {
            dropPosition,
            entityToDrop,
            targetEntity,
            items,
            stacks,
            bugs,
            structures,
            queryClient,
          }
        );
      })();
    },
    [cols, handleItemDropCancelled, items, rows, stacks, bugs, structures, entities, queryClient],
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
      if (isDemolishMode && canDemolishStructureType(structure.structureType, items)) {
        if (getHouseOccupants(structure).length > 0) {
          setOccupiedHouseType(structure.structureType);
          return;
        }

        setOccupiedHouseType(null);
        const remainingCount = structure.items.length + structure.bugs.length;
        if (remainingCount > 1 && !hasEmptyGridCell(rows, cols, animatables)) {
          return;
        }

        void (async () => {
          const result = await demolishQueue.enqueue(structure.id);
          const origin = pickRandomNearestStructureCenterCell(structure);
          if (result.structure) {
            const updatedStructure = result.structure;
            setStructuresCache((prev) =>
              prev.map((existing) =>
                existing.id === updatedStructure.id ? updatedStructure : existing,
              ),
            );
          } else {
            setStructuresCache((prev) => prev.filter((existing) => existing.id !== structure.id));
          }
          if (result.item) {
            const extractedItem = result.item;
            setItemsCache((prev) => [
              ...prev,
              { ...extractedItem, fromX: origin.x, fromY: origin.y },
            ]);
          }
          if (result.bug) {
            const extractedBug = result.bug;
            setBugsCache((prev) => [
              ...prev,
              { ...extractedBug, fromX: origin.x, fromY: origin.y },
            ]);
          }
        })();
        return;
      }

      if (canDigAtStructureType(structure.structureType)) {
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
      isDemolishMode,
      beginAutoRouteIfPossible,
      beginAutoRouteBugIfPossible,
      setItemsCache,
      setBugsCache,
      setStructuresCache,
    ],
  );

  const onBugClick = useCallback((bug: Bug) => {
    setSelectedBug(bug);
  }, []);

  const onEntityClick = useCallback(
    (entity: GridEntity) => {
      if (isStructure(entity)) {
        onStructureClick(entity);
      } else if (isStack(entity)) {
        onStackClick(entity);
      } else if (isItem(entity) && entity.itemType === "hammer" && isItemCrafted(entity)) {
        setIsDemolishMode(!isDemolishMode);
      } else if (
        isBug(entity) &&
        (entity.bugType === "beetle" ||
          entity.bugType === "ladybug" ||
          (entity.bugType === "greenfly" && !isBugFed(entity)))
      ) {
        onBugClick(entity);
      }
    },
    [isDemolishMode, onBugClick, onStackClick, onStructureClick, setIsDemolishMode],
  );

  const onBeetleBuild = useCallback(
    (structure: Structure) => {
      if (!isBuildableStructureType(structure.structureType)) {
        return;
      }
      const position = findFirstStructurePlacement(
        { structureType: structure.structureType },
        cols,
        rows,
        entities,
      );
      if (!position) {
        return;
      }
      createStructure.mutate({
        structureType: structure.structureType,
        ...position,
      });
      setSelectedBug(null);
      setFarmPopupOpen(false);
    },
    [cols, rows, entities, createStructure],
  );

  const onLadybugUpgrade = useCallback(
    (structure: Structure) => {
      upgradeStructureMutation.mutate(structure);
      setSelectedBug(null);
    },
    [upgradeStructureMutation],
  );

  const onWorkshopCreateItem = useCallback(
    (itemType: ItemType) => {
      if (
        !isWorkshopItemUnlocked(itemType, workshopUpgradeLevel) ||
        !canCreateItemType(items, itemType)
      ) {
        return;
      }
      const position = findFirstStructurePlacement({ itemType }, cols, rows, entities);
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
    [cols, rows, entities, items, createItem, workshopUpgradeLevel],
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
        <StructureDemolishHighlightLayer
          cols={cols}
          rows={rows}
          structures={structures}
          items={items}
          gridDrag={gridDrag}
        />
        <GroundGridInteractionLayer
          cols={cols}
          rows={rows}
          entities={entities}
          onEntityClick={onEntityClick}
          onDragChange={setGridDrag}
          onEntityDropped={handleEntityDropped}
        />
        {blockedStackHint ? (
          <StackCreateBlockedHintLayer
            key={blockedStackHint.nonce}
            cols={cols}
            rows={rows}
            origin={blockedStackHint.origin}
            onComplete={() => setBlockedStackHint(null)}
          />
        ) : null}
        <BugPopups
          selectedBug={selectedBug}
          structures={structures}
          onClose={() => setSelectedBug(null)}
          onBuild={onBeetleBuild}
          onUpgrade={onLadybugUpgrade}
        />
        {workshopPopupOpen && (
          <WorkshopPopup
            onClose={() => setWorkshopPopupOpen(false)}
            onCreateItem={onWorkshopCreateItem}
            items={items}
            workshopUpgradeLevel={workshopUpgradeLevel}
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
        {occupiedHouseType && (
          <HouseOccupiedPopup
            structureType={occupiedHouseType}
            onClose={() => setOccupiedHouseType(null)}
          />
        )}
      </div>
    </div>
  );
}
