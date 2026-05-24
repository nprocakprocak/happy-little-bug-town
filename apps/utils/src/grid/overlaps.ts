import { Position } from "@happy-little-park/utils";
import { Positionable } from "../types/positionable.js";

function positionOverlaps(position: Position, structure: Positionable): boolean {
  return (
    position.x >= structure.x &&
    position.x < structure.x + (structure.span ?? 1) &&
    position.y >= structure.y &&
    position.y < structure.y + (structure.span ?? 1)
  );
}

export function positionOverlapsAnyEntity(position: Position, entities: Positionable[]): boolean {
  return entities.some((entity) => positionOverlaps(position, entity));
}

export function findOverlappingEntity(position: Position, entities: Positionable[]): Positionable | undefined {
  return entities.find((entity) => positionOverlaps(position, entity));
}

export function structureFootprintFits(
  origin: Positionable,
  gridWidth: number,
  gridHeight: number,
  entities: Positionable[],
): boolean {
  const span = origin.span ?? 1;

  if (origin.x < 1 || origin.y < 1) {
    return false;
  }
  
  if (origin.x + span - 1 > gridWidth || origin.y + span - 1 > gridHeight) {
    return false;
  }

  for (let dx = 0; dx < span; dx++) {
    for (let dy = 0; dy < span; dy++) {
      const cell = { x: origin.x + dx, y: origin.y + dy };
      if (positionOverlapsAnyEntity(cell, entities)) {
        return false;
      }
    }
  }

  return true;
}
