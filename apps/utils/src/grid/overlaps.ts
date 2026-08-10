import { getItemSpan } from "../items/span.js";
import { getStackSpan } from "../stacks/span.js";
import { getStructureSpan } from "../structures/span.js";
import { getToolSpan } from "../tools/span.js";
import { Position } from "../types/position.js";
import { Positionable } from "../types/positionable.js";
import { Spannable } from "../types/spannable.js";

export function getSpannableSpan(spannable: Spannable): number {
  if ("structureType" in spannable && spannable.structureType !== undefined) {
    return getStructureSpan(spannable.structureType);
  }

  if ("itemsCount" in spannable && spannable.itemsCount !== undefined) {
    return getStackSpan();
  }

  if ("toolType" in spannable && spannable.toolType !== undefined) {
    return getToolSpan(spannable.toolType);
  }

  if ("itemType" in spannable && spannable.itemType !== undefined) {
    return getItemSpan(spannable.itemType);
  }

  // bug span
  return 1;
}

function positionOverlaps(position: Position, entity: Positionable): boolean {
  const span = getSpannableSpan(entity);

  return (
    position.x >= entity.x &&
    position.x < entity.x + span &&
    position.y >= entity.y &&
    position.y < entity.y + span
  );
}

export function positionOverlapsAnyEntity(
  position: Position,
  entities: Positionable[],
): boolean {
  return entities.some((entity) => positionOverlaps(position, entity));
}

export function findOverlappingEntity(
  position: Position,
  entities: Positionable[],
): Positionable | undefined {
  return entities.find((entity) => positionOverlaps(position, entity));
}

export function structureFootprintFits(
  origin: Positionable,
  gridWidth: number,
  gridHeight: number,
  entities: Positionable[],
): boolean {
  const span = getSpannableSpan(origin);

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
