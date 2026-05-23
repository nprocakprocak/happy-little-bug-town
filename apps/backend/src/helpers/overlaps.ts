import { Position } from "../types/position.js";
import { Structure, Stack } from "../prisma/prisma/client.js";
import { BugDto } from "../types/bugDto.js";
import { ItemDto } from "../types/itemDto.js";

// todo: unify with frontend and extract these helpers to a package

export function positionOverlapsStructure(position: Position, structure: Structure): boolean {
  return (
    position.x >= structure.x &&
    position.x < structure.x + structure.span &&
    position.y >= structure.y &&
    position.y < structure.y + structure.span
  );
}

function positionOverlapsItem(position: Position, item: ItemDto | Stack | BugDto): boolean {
  return position.x === item.x && position.y === item.y;
}

export function positionOverlapsAnyStructure(
  position: Position,
  structures: Structure[],
): boolean {
  return structures.some((structure) => positionOverlapsStructure(position, structure));
}

export function positionOverlapsAnyItem(position: Position, items: ItemDto[]): boolean {
  return items.some((item) => positionOverlapsItem(position, item));
}

export function positionOverlapsAnyStack(position: Position, stacks: Stack[]): boolean {
  return stacks.some((stack) => positionOverlapsItem(position, stack));
}

export function positionOverlapsAnyBug(position: Position, bugs: BugDto[]): boolean {
  return bugs.some((bug) => positionOverlapsItem(position, bug));
}

export function positionOverlapsAnything(
  position: Position,
  structures: Structure[],
  items: ItemDto[],
  stacks: Stack[],
  bugs: BugDto[] = [],
): boolean {
  return (
    positionOverlapsAnyStructure(position, structures) ||
    positionOverlapsAnyItem(position, items) ||
    positionOverlapsAnyStack(position, stacks) ||
    positionOverlapsAnyBug(position, bugs)
  );
}

export function structureFootprintFits(
  origin: Position,
  span: number,
  gridWidth: number,
  gridHeight: number,
  structures: Structure[],
  items: ItemDto[],
  stacks: Stack[],
  bugs: BugDto[] = [],
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
      if (positionOverlapsAnyItem(cell, items)) {
        return false;
      }
      if (positionOverlapsAnyStack(cell, stacks)) {
        return false;
      }
      if (positionOverlapsAnyBug(cell, bugs)) {
        return false;
      }
    }
  }

  return true;
}
