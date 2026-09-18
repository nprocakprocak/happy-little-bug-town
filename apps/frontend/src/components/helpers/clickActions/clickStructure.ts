import {
  canCraftFromStructureOperationalResources,
  canDemolishStructureType,
  canDigAtStructureType,
  getGreenflyHouseOccupants,
  getHouseOccupants,
  hasEmptyGridCell,
  isStructurePowered,
  Position,
  Positionable,
  StructureType,
} from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { craftOperationalResource } from "../../../api/structures";
import { updateBugsCache } from "../../../hooks/useBugs";
import { updateItemsCache } from "../../../hooks/useItems";
import { updateStructuresCache } from "../../../hooks/useStructures";
import { demolishQueue } from "../../../services/demolishQueue";
import { digQueue } from "../../../services/digQueue";
import { extractOccupantQueue } from "../../../services/extractOccupantQueue";
import { Bug } from "../../../types/bug";
import { Item } from "../../../types/item";
import { Structure } from "../../../types/structure";
import {
  getBeetleHouseExtractOrigin,
  pickRandomNearestStructureCenterCell,
} from "../structurePosition";
import { isItem } from "../typeGuards";
import { spawnExtractedBug, spawnExtractedItem } from "./spawnExtractedEntity";

interface ClickStructureArgs {
  structure: Structure;
  queryClient: QueryClient;
  rows: number;
  cols: number;
  entities: Positionable[];
  items: Item[];
  isDemolishMode: boolean;
  beginAutoRouteIfPossible: Parameters<typeof spawnExtractedItem>[3];
  beginAutoRouteBugIfPossible: Parameters<typeof spawnExtractedBug>[3];
}

type ClickStructureResult =
  | { kind: "done" }
  | { kind: "noop" }
  | { kind: "openWorkshop" }
  | { kind: "openFarm" }
  | { kind: "occupiedHouse"; structureType: StructureType }
  | { kind: "clearOccupiedHouse" }
  | { kind: "dugItem"; item: Item }
  | { kind: "dugBug"; bug: Bug }
  | { kind: "noSpace" };

export async function clickStructure(args: ClickStructureArgs): Promise<ClickStructureResult> {
  if (isDemolishClick(args)) {
    return demolishStructureClick(args);
  }

  if (canDigAtStructureType(args.structure.structureType)) {
    return digStructureClick(args);
  }

  const poweredPopup = poweredPopupResult(args.structure);
  if (poweredPopup) {
    return poweredPopup;
  }

  if (canCraftFromStructureOperationalResources(args.structure)) {
    return craftStructureClick(args);
  }

  if (args.structure.structureType === "beetle_house") {
    return beetleHouseClick(args);
  }

  if (args.structure.structureType === "greenfly_house") {
    return greenflyHouseClick(args);
  }

  return { kind: "noop" };
}

function isDemolishClick({ structure, items, isDemolishMode }: ClickStructureArgs): boolean {
  return isDemolishMode && canDemolishStructureType(structure.structureType, items);
}

function poweredPopupResult(structure: Structure): ClickStructureResult | null {
  if (structure.structureType === "workshop" && isStructurePowered(structure)) {
    return { kind: "openWorkshop" };
  }

  if (structure.structureType === "farm" && isStructurePowered(structure)) {
    return { kind: "openFarm" };
  }

  return null;
}

async function demolishStructureClick({
  structure,
  queryClient,
  rows,
  cols,
  entities,
}: ClickStructureArgs): Promise<ClickStructureResult> {
  if (getHouseOccupants(structure).length > 0) {
    return { kind: "occupiedHouse", structureType: structure.structureType };
  }

  const remainingCount = structure.items.length + structure.bugs.length;
  if (remainingCount > 1 && !hasEmptyGridCell(rows, cols, entities)) {
    return { kind: "noSpace" };
  }

  const result = await demolishQueue.enqueue(structure.id);
  const origin = pickRandomNearestStructureCenterCell(structure);

  if (result.structure) {
    replaceCachedStructure(queryClient, result.structure);
  } else {
    removeCachedStructure(queryClient, structure.id);
  }

  if (result.item) {
    placeItemAtOrigin(queryClient, result.item, origin);
  }
  if (result.bug) {
    placeBugAtOrigin(queryClient, result.bug, origin);
  }

  return { kind: "clearOccupiedHouse" };
}

async function digStructureClick({
  structure,
  queryClient,
  rows,
  cols,
  entities,
  beginAutoRouteIfPossible,
  beginAutoRouteBugIfPossible,
}: ClickStructureArgs): Promise<ClickStructureResult> {
  if (!hasEmptyGridCell(rows, cols, entities)) {
    return { kind: "noSpace" };
  }

  const itemOrBug = await digQueue.enqueue(structure.id);
  const origin = pickRandomNearestStructureCenterCell(structure);
  const exclude = { structureId: structure.id };

  if (isItem(itemOrBug)) {
    spawnExtractedItem(itemOrBug, origin, queryClient, beginAutoRouteIfPossible, exclude);
    return { kind: "dugItem", item: itemOrBug };
  }

  spawnExtractedBug(itemOrBug, origin, queryClient, beginAutoRouteBugIfPossible, exclude);
  return { kind: "dugBug", bug: itemOrBug };
}

async function craftStructureClick({
  structure,
  queryClient,
  rows,
  cols,
  entities,
  beginAutoRouteIfPossible,
  beginAutoRouteBugIfPossible,
}: ClickStructureArgs): Promise<ClickStructureResult> {
  if (!hasEmptyGridCell(rows, cols, entities)) {
    return { kind: "noSpace" };
  }

  const result = await craftOperationalResource(structure.id);
  const origin = pickRandomNearestStructureCenterCell(structure);
  replaceCachedStructure(queryClient, result.structure);

  if (result.bug) {
    spawnExtractedBug(result.bug, origin, queryClient, beginAutoRouteBugIfPossible, {
      structureId: structure.id,
    });
  } else if (result.item) {
    spawnExtractedItem(result.item, origin, queryClient, beginAutoRouteIfPossible, {
      structureId: structure.id,
    });
  }

  return { kind: "done" };
}

async function beetleHouseClick(args: ClickStructureArgs): Promise<ClickStructureResult> {
  const { structure, rows, cols, entities, queryClient } = args;
  if ((structure.bugs ?? []).length === 0) {
    return { kind: "noop" };
  }
  if (!hasEmptyGridCell(rows, cols, entities)) {
    return { kind: "noSpace" };
  }

  const { occupant, origin } = await extractOccupantAndUpdateStructure(args);
  placeBugAtOrigin(queryClient, occupant, origin);
  return { kind: "done" };
}

async function greenflyHouseClick(args: ClickStructureArgs): Promise<ClickStructureResult> {
  const { structure, rows, cols, entities, queryClient, beginAutoRouteBugIfPossible } = args;
  if (getGreenflyHouseOccupants(structure).length === 0) {
    return { kind: "noop" };
  }
  if (!hasEmptyGridCell(rows, cols, entities)) {
    return { kind: "noSpace" };
  }

  const { occupant, origin } = await extractOccupantAndUpdateStructure(args);
  spawnExtractedBug(occupant, origin, queryClient, beginAutoRouteBugIfPossible, {
    structureId: structure.id,
    onlyOperational: true,
  });
  return { kind: "done" };
}

async function extractOccupantAndUpdateStructure({ structure, queryClient }: ClickStructureArgs) {
  const result = await extractOccupantQueue.enqueue(structure.id);
  replaceCachedStructure(queryClient, result.structure);
  return {
    occupant: result.extractedOccupant,
    origin: getBeetleHouseExtractOrigin(structure),
  };
}

function replaceCachedStructure(queryClient: QueryClient, structure: Structure) {
  updateStructuresCache(queryClient, (prev) =>
    prev.map((existing) => (existing.id === structure.id ? structure : existing)),
  );
}

function removeCachedStructure(queryClient: QueryClient, structureId: string) {
  updateStructuresCache(queryClient, (prev) =>
    prev.filter((existing) => existing.id !== structureId),
  );
}

function placeItemAtOrigin(queryClient: QueryClient, item: Item, origin: Position) {
  updateItemsCache(queryClient, (prev) => [...prev, { ...item, fromX: origin.x, fromY: origin.y }]);
}

function placeBugAtOrigin(queryClient: QueryClient, bug: Bug, origin: Position) {
  updateBugsCache(queryClient, (prev) => [...prev, { ...bug, fromX: origin.x, fromY: origin.y }]);
}
