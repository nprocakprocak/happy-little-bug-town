import { Position } from "@happy-little-park/utils";

import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
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

function positionOverlapsEntity(position: Position, entity: Position): boolean {
  return position.x === entity.x && position.y === entity.y;
}

export function positionOverlapsAnyStructure(position: Position, structures: Structure[]): boolean {
  return structures.some((structure) => positionOverlapsStructure(position, structure));
}

export function positionOverlapsAnyEntity(position: Position, entities: Position[]): boolean {
  return entities.some((item) => positionOverlapsEntity(position, item));
}

export function positionOverlapsAnything(
  position: Position,
  structures: Structure[],
  entities: Position[],
): boolean {
  return (
    positionOverlapsAnyStructure(position, structures) ||
    positionOverlapsAnyEntity(position, entities)
  );
}

export function findOverlappingItem(position: Position, items: Item[]): Item | undefined {
  return items.find((item) => positionOverlapsEntity(position, item));
}

export function findOverlappingStack(position: Position, stacks: Stack[]): Stack | undefined {
  return stacks.find((stack) => positionOverlapsEntity(position, stack));
}

export function findOverlappingBug(position: Position, bugs: Bug[]): Bug | undefined {
  return bugs.find((bug) => positionOverlapsEntity(position, bug));
}

export function structureFootprintFits(
  origin: Position,
  span: number,
  gridWidth: number,
  gridHeight: number,
  structures: Structure[],
  entities: Position[],
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
      if (positionOverlapsAnyEntity(cell, entities)) {
        return false;
      }
    }
  }

  return true;
}
