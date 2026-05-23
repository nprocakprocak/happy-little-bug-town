import { Item } from "../../types/item";
import { Position } from "../../types/position";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";

export function positionOverlapsStructure(position: Position, structure: Structure): boolean {
  return (
    position.x >= structure.x &&
    position.x < structure.x + structure.span &&
    position.y >= structure.y &&
    position.y < structure.y + structure.span
  );
}

function positionOverlapsItemOrStack(position: Position, itemOrStack: Position): boolean {
  return position.x === itemOrStack.x && position.y === itemOrStack.y;
}

export function positionOverlapsAnyStructure(position: Position, structures: Structure[]): boolean {
  return structures.some((structure) => positionOverlapsStructure(position, structure));
}

export function positionOverlapsAnyItem(position: Position, itemsOrStacks: Position[]): boolean {
  return itemsOrStacks.some((item) => positionOverlapsItemOrStack(position, item));
}

export function positionOverlapsAnything(
  position: Position,
  structures: Structure[],
  itemsOrStacks: Position[],
): boolean {
  return (
    positionOverlapsAnyStructure(position, structures) ||
    positionOverlapsAnyItem(position, itemsOrStacks)
  );
}

export function findOverlappingItem(position: Position, items: Item[]): Item | undefined {
  return items.find((item) => positionOverlapsItemOrStack(position, item));
}

export function findOverlappingStack(position: Position, stacks: Stack[]): Stack | undefined {
  return stacks.find((stack) => positionOverlapsItemOrStack(position, stack));
}

export function structureFootprintFits(
  origin: Position,
  span: number,
  gridWidth: number,
  gridHeight: number,
  structures: Structure[],
  itemsOrStacks: Position[],
): boolean {
  if (origin.x < 1 || origin.y < 1) {
    return false;
  }
  if (origin.x + span - 1 > gridWidth || origin.y + span - 1 > gridHeight) {
    return false;
  }

  for (let dx = 0; dx < span; dx++) {
    for (let dy = 0; dy < span; dy++) {
      const cell = { x: origin.x + dx, y: origin.y + dy };
      if (positionOverlapsAnyStructure(cell, structures)) {
        return false;
      }
      if (positionOverlapsAnyItem(cell, itemsOrStacks)) {
        return false;
      }
    }
  }

  return true;
}
