import { Position } from "../types/position.js";
import { Structure, Stack } from "../prisma/prisma/client.js";
import { ItemDto } from "../types/itemDto.js";

export function positionOverlapsStructure(position: Position, structure: Structure): boolean {
  return (
    position.x >= structure.x &&
    position.x < structure.x + structure.span &&
    position.y >= structure.y &&
    position.y < structure.y + structure.span
  );
}

function positionOverlapsItem(position: Position, item: ItemDto | Stack): boolean {
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

export function positionOverlapsAnything(
  position: Position,
  structures: Structure[],
  items: ItemDto[],
  stacks: Stack[],
): boolean {
  return (
    positionOverlapsAnyStructure(position, structures) ||
    positionOverlapsAnyItem(position, items) ||
    positionOverlapsAnyStack(position, stacks)
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
    }
  }

  return true;
}
