import {
  BugType,
  canAcceptOperationalResourceForStructure,
  canStackItemType,
  canStructureAcceptBugDrop,
  canStructureAcceptGreenflyDrop,
  hasStructureAssignedTermite,
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

export function structuresWithPendingAutoRoutes(
  structures: Structure[],
  pendingItems: PendingAutoRouteStructureItem[],
): Structure[] {
  if (pendingItems.length === 0) {
    return structures;
  }

  const pendingByStructureId = new Map<string, { id: string; itemType: ItemType }[]>();
  for (const pendingItem of pendingItems) {
    const existing = pendingByStructureId.get(pendingItem.structureId) ?? [];
    existing.push({ id: pendingItem.id, itemType: pendingItem.itemType });
    pendingByStructureId.set(pendingItem.structureId, existing);
  }

  return structures.map((structure) => {
    const pendingForStructure = pendingByStructureId.get(structure.id);
    if (!pendingForStructure) {
      return structure;
    }

    return {
      ...structure,
      items: [...structure.items, ...pendingForStructure],
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

function findHouseForItem(
  itemType: ItemType,
  structures: Structure[],
  origin?: Position,
  excludeStructureId?: string,
): Structure | undefined {
  return pickNearest(
    structures.filter(
      (structure) =>
        structure.id !== excludeStructureId &&
        canStructureAcceptGreenflyDrop({ itemType }, structure),
    ),
    origin,
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
        structure.structureType === "beetle_house" &&
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

  const house = findHouseForItem(itemType, structures, origin, exclude?.structureId);
  if (house) {
    return toStructureTarget(house);
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
  bugType: BugType,
  structures: Structure[],
  origin?: Position,
  excludeStructureId?: string,
): AutoRouteToStructure | undefined {
  const house = findHouseForBug(bugType, structures, origin, excludeStructureId);
  if (!house) {
    return undefined;
  }

  return toStructureTarget(house);
}
