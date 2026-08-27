import {
  BugType,
  canAcceptOperationalBugForStructure,
  canAcceptOperationalResourceForStructure,
  canStackItemType,
  canStructureAcceptBugDrop,
  hasStructureAssignedTermite,
  isBugFed,
  ItemType,
  Position,
} from "@happy-little-bug-town/utils";

import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";

interface AutoRouteToStructure {
  kind: "structure";
  structureId: string;
  x: number;
  y: number;
}

interface AutoRouteToStack {
  kind: "stack";
  stackId: string;
  x: number;
  y: number;
}

interface AutoRouteExclude {
  structureId?: string;
  stackId?: string;
  onlyOperational?: boolean;
}

interface PendingAutoRouteStructureItem {
  structureId: string;
  id: string;
  itemType: ItemType;
}

interface PendingAutoRouteStructureBug {
  structureId: string;
  id: string;
  bugType: BugType;
}

export function structuresWithPendingAutoRoutes(
  structures: Structure[],
  pendingItems: PendingAutoRouteStructureItem[],
  pendingBugs: PendingAutoRouteStructureBug[] = [],
): Structure[] {
  if (pendingItems.length === 0 && pendingBugs.length === 0) {
    return structures;
  }

  const pendingItemsByStructureId = new Map<string, { id: string; itemType: ItemType }[]>();
  for (const pendingItem of pendingItems) {
    const existing = pendingItemsByStructureId.get(pendingItem.structureId) ?? [];
    existing.push({ id: pendingItem.id, itemType: pendingItem.itemType });
    pendingItemsByStructureId.set(pendingItem.structureId, existing);
  }

  const pendingBugsByStructureId = new Map<string, { id: string; bugType: BugType }[]>();
  for (const pendingBug of pendingBugs) {
    const existing = pendingBugsByStructureId.get(pendingBug.structureId) ?? [];
    existing.push({ id: pendingBug.id, bugType: pendingBug.bugType });
    pendingBugsByStructureId.set(pendingBug.structureId, existing);
  }

  return structures.map((structure) => {
    const pendingItemsForStructure = pendingItemsByStructureId.get(structure.id);
    const pendingBugsForStructure = pendingBugsByStructureId.get(structure.id);
    if (!pendingItemsForStructure && !pendingBugsForStructure) {
      return structure;
    }

    return {
      ...structure,
      items: pendingItemsForStructure
        ? [...structure.items, ...pendingItemsForStructure]
        : structure.items,
      bugs: pendingBugsForStructure
        ? [...structure.bugs, ...pendingBugsForStructure]
        : structure.bugs,
    };
  });
}

function gridDistance(origin: Position, target: Position): number {
  return Math.abs(target.x - origin.x) + Math.abs(target.y - origin.y);
}

function pickNearest<T extends Position>(candidates: T[], origin?: Position): T | undefined {
  if (candidates.length === 0) {
    return undefined;
  }

  if (!origin || candidates.length === 1) {
    return candidates[0];
  }

  return candidates.reduce((nearest, candidate) =>
    gridDistance(origin, candidate) < gridDistance(origin, nearest) ? candidate : nearest,
  );
}

function findHouseForBug(
  bugType: BugType,
  structures: Structure[],
  origin?: Position,
  excludeStructureId?: string,
): Structure | undefined {
  return pickNearest(
    structures.filter(
      (structure) =>
        structure.id !== excludeStructureId &&
        (structure.structureType === "beetle_house" ||
          structure.structureType === "greenfly_house") &&
        canStructureAcceptBugDrop({ bugType }, structure),
    ),
    origin,
  );
}

function findStructureWithAssignedTermite(
  itemType: ItemType,
  structures: Structure[],
  origin?: Position,
  excludeStructureId?: string,
): Structure | undefined {
  return pickNearest(
    structures.filter(
      (structure) =>
        structure.id !== excludeStructureId &&
        hasStructureAssignedTermite(structure) &&
        canAcceptOperationalResourceForStructure(structure, itemType),
    ),
    origin,
  );
}

function findStructureWithAssignedTermiteForBug(
  bugType: BugType,
  structures: Structure[],
  origin?: Position,
  excludeStructureId?: string,
): Structure | undefined {
  return pickNearest(
    structures.filter(
      (structure) =>
        structure.id !== excludeStructureId &&
        hasStructureAssignedTermite(structure) &&
        canAcceptOperationalBugForStructure(structure, bugType),
    ),
    origin,
  );
}

function findStackWithAssignedAnt(
  itemType: ItemType,
  stacks: Stack[],
  origin?: Position,
  excludeStackId?: string,
): Stack | undefined {
  return pickNearest(
    stacks.filter(
      (stack) =>
        stack.id !== excludeStackId &&
        stack.itemType === itemType &&
        (stack.bugs ?? []).some((bug) => bug.bugType === "ant"),
    ),
    origin,
  );
}

function toStructureTarget(structure: Structure): AutoRouteToStructure {
  return {
    kind: "structure",
    structureId: structure.id,
    x: structure.x,
    y: structure.y,
  };
}

export function findAutoRouteTarget(
  itemType: ItemType,
  structures: Structure[],
  stacks: Stack[],
  gridItems: Item[],
  origin?: Position,
  exclude?: AutoRouteExclude,
): AutoRouteToStructure | AutoRouteToStack | undefined {
  const structure = findStructureWithAssignedTermite(
    itemType,
    structures,
    origin,
    exclude?.structureId,
  );
  if (structure) {
    return toStructureTarget(structure);
  }

  if (exclude?.onlyOperational) {
    return undefined;
  }

  if (!canStackItemType(itemType, gridItems)) {
    return undefined;
  }

  const stack = findStackWithAssignedAnt(itemType, stacks, origin, exclude?.stackId);
  if (!stack) {
    return undefined;
  }

  return {
    kind: "stack",
    stackId: stack.id,
    x: stack.x,
    y: stack.y,
  };
}

export function findAutoRouteBugTarget(
  bug: { bugType: BugType; items: { itemType: ItemType }[] },
  structures: Structure[],
  origin?: Position,
  exclude?: AutoRouteExclude,
): AutoRouteToStructure | undefined {
  const canUseOperational = isBugFed(bug);
  const operational = canUseOperational
    ? findStructureWithAssignedTermiteForBug(bug.bugType, structures, origin, exclude?.structureId)
    : undefined;
  if (operational) {
    return toStructureTarget(operational);
  }

  if (exclude?.onlyOperational) {
    return undefined;
  }

  const house = findHouseForBug(bug.bugType, structures, origin, exclude?.structureId);
  if (!house) {
    return undefined;
  }

  return toStructureTarget(house);
}
