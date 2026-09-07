"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCompletedUpgradeLevel,
  ItemType,
  Position,
  StructureType,
} from "@happy-little-bug-town/utils";
import { useQueryClient } from "@tanstack/react-query";

import { GROUND_GRID_MAX_WIDTH_PX } from "../../constants/layout";
import { useAuth } from "../../context/AuthContext";
import { useAutoRouteItems } from "../../hooks/useAutoRouteItems";
import { useBugsQuery } from "../../hooks/useBugs";
import { useDialogues } from "../../hooks/useDialogues";
import { useCreateItemMutation, useItemsQuery } from "../../hooks/useItems";
import { useStacksQuery } from "../../hooks/useStacks";
import {
  useCreateFirstStructureMutation,
  useCreateStructureMutation,
  useStructuresQuery,
  useUpgradeStructureMutation,
} from "../../hooks/useStructures";
import { useMainStore } from "../../stores/main";
import { Bug } from "../../types/bug";
import { GridEntity } from "../../types/gridEntity";
import { Structure } from "../../types/structure";
import {
  dugFirstBeetleDialogue,
  dugFirstItemDialogue,
  welcomeDialogue,
} from "../../utils/dialogue";
import { DialogueBubble } from "../dialogue/DialogueBubble";
import { DialogueCursorLayer } from "../dialogue/DialogueCursorLayer";
import { clickAction } from "../helpers/clickAction";
import { beetleBuildAction, workshopCreateItemAction } from "../helpers/createGridEntityAction";
import { dropAction } from "../helpers/dropAction";
import { completeFlightAction, setEntityFlightOrigin } from "../helpers/entityFlightOrigin";
import { shouldCancelDrop } from "../helpers/pointerUp/shouldCancelDrop";
import { isBug } from "../helpers/typeGuards";
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
  return <GroundGridBoard key={anonymousId} rows={rows} cols={cols} />;
}

function GroundGridBoard({ rows, cols }: GroundGridProps) {
  const { anonymousId } = useAuth();
  const queryClient = useQueryClient();
  const isAuthenticated = Boolean(anonymousId);

  const { data: structures = [], isSuccess: structuresLoaded } =
    useStructuresQuery(isAuthenticated);
  const canLoadGridData = isAuthenticated && structures.length > 0;
  const { data: items = [], isSuccess: itemsLoaded } = useItemsQuery(canLoadGridData);
  const { data: bugs = [], isSuccess: bugsLoaded } = useBugsQuery(canLoadGridData);
  const { data: stacks = [], isSuccess: stacksLoaded } = useStacksQuery(canLoadGridData);
  const allEntitiesLoaded = structuresLoaded && itemsLoaded && bugsLoaded && stacksLoaded;
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
  const { activeDialogue, closeDialogue, showDialogue, showDialogueIfNotVisited } = useDialogues(
    allEntitiesLoaded,
    entities,
    isAuthenticated,
  );

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
    createFirstStructureMutate(undefined, {
      onSuccess: (structure) => {
        showDialogueIfNotVisited(welcomeDialogue(structure.id));
      },
    });
  }, [
    structuresLoaded,
    structures.length,
    isCreatingFirstStructure,
    firstStructureCreateFailed,
    createFirstStructureMutate,
    showDialogueIfNotVisited,
  ]);

  useEffect(() => {
    if (!isDemolishMode) {
      setOccupiedHouseType(null);
    }
  }, [isDemolishMode]);

  const handleFlightComplete = useCallback(
    (entityId: string) => {
      completeFlightAction(queryClient, entityId, completeAutoRouteFlight);
    },
    [completeAutoRouteFlight, queryClient],
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
          setEntityFlightOrigin(queryClient, entityToDrop.id, dropPosition);
          return;
        }

        await dropAction({
          dropPosition,
          entityToDrop,
          targetEntity,
          items,
          stacks,
          bugs,
          structures,
          queryClient,
        });
      })();
    },
    [cols, items, rows, stacks, bugs, structures, entities, queryClient],
  );

  const onEntityClick = useCallback(
    (entity: GridEntity) => {
      void (async () => {
        const result = await clickAction({
          entity,
          queryClient,
          rows,
          cols,
          animatables,
          items,
          isDemolishMode,
          beginAutoRouteIfPossible,
          beginAutoRouteBugIfPossible,
        });

        if (result.kind === "occupiedHouse") {
          setOccupiedHouseType(result.structureType);
        } else if (result.kind === "clearOccupiedHouse") {
          setOccupiedHouseType(null);
        } else if (result.kind === "openWorkshop") {
          setWorkshopPopupOpen(true);
        } else if (result.kind === "openFarm") {
          setFarmPopupOpen(true);
        } else if (result.kind === "selectBug") {
          closeDialogue();
          setSelectedBug(result.bug);
        } else if (result.kind === "dugItem") {
          setSelectedBug(null);
          const hintDialogue = dugFirstItemDialogue(result.item.itemType);
          if (hintDialogue) {
            showDialogueIfNotVisited(hintDialogue);
          }
        } else if (result.kind === "dugBug") {
          setSelectedBug(null);
          if (result.bug.bugType === "beetle") {
            showDialogueIfNotVisited(dugFirstBeetleDialogue());
          }
        } else if (result.kind === "showDialogue") {
          setSelectedBug(null);
          showDialogue(result.dialogue);
        } else if (result.kind === "toggleDemolish") {
          setIsDemolishMode(!isDemolishMode);
        }
      })();
    },
    [
      animatables,
      beginAutoRouteBugIfPossible,
      beginAutoRouteIfPossible,
      closeDialogue,
      cols,
      isDemolishMode,
      items,
      queryClient,
      rows,
      setIsDemolishMode,
      showDialogue,
      showDialogueIfNotVisited,
    ],
  );

  const onBeetleBuild = useCallback(
    (structure: Structure) => {
      const payload = beetleBuildAction(structure, cols, rows, entities);
      if (!payload) {
        return;
      }
      createStructure.mutate(payload);
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
      const payload = workshopCreateItemAction(
        itemType,
        workshopUpgradeLevel,
        items,
        cols,
        rows,
        entities,
      );
      if (!payload) {
        return;
      }
      createItem.mutate(payload, {
        onSuccess: () => setWorkshopPopupOpen(false),
      });
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
        {activeDialogue?.cursorEntityId ? (
          <DialogueCursorLayer
            cols={cols}
            rows={rows}
            entityId={activeDialogue.cursorEntityId}
            entities={entities}
          />
        ) : null}
        {activeDialogue ? (
          <DialogueBubble
            key={activeDialogue.text}
            dialogue={activeDialogue}
            onClose={closeDialogue}
          />
        ) : null}
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
