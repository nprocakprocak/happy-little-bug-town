import { ItemType, Position } from "@happy-little-bug-town/utils";

import { Stack } from "../types/stack";

function gridDistance(origin: Position, target: Position): number {
  return Math.abs(target.x - origin.x) + Math.abs(target.y - origin.y);
}

export function findStackWithAssignedAnt(
  itemType: ItemType,
  stacks: Stack[],
  origin?: Position,
): Stack | undefined {
  const matching = stacks.filter(
    (stack) =>
      stack.itemType === itemType && (stack.bugs ?? []).some((bug) => bug.bugType === "ant"),
  );

  if (matching.length === 0) {
    return undefined;
  }

  if (!origin || matching.length === 1) {
    return matching[0];
  }

  return matching.reduce((nearest, stack) =>
    gridDistance(origin, stack) < gridDistance(origin, nearest) ? stack : nearest,
  );
}
