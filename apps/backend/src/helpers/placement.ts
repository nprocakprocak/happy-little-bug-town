import {
  GROUND_HEIGHT,
  GROUND_WIDTH,
  Position,
  Positionable,
  structureFootprintFits,
} from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { prisma } from "../lib/prisma.js";
import { findNearestEmptyPositionForAuthor, getPositionedEntitiesOnGrid } from "./gridPlacement.js";
import { getValidCoords } from "./validateCoords.js";

export function requireCoords(x: unknown, y: unknown): Position {
  const coords = getValidCoords(x, y);
  if (!coords) {
    throw new AppError(400, "x and y are required");
  }
  return coords;
}

interface AssertFootprintOptions {
  excludePosition?: Position | Position[];
}

function toExcludeList(excludePosition: Position | Position[] | undefined): Position[] {
  if (!excludePosition) {
    return [];
  }
  return Array.isArray(excludePosition) ? excludePosition : [excludePosition];
}

function isExcluded(entity: Positionable, excluded: Position[]): boolean {
  return excluded.some((position) => entity.x === position.x && entity.y === position.y);
}

export async function assertFootprintFits(
  authorId: string,
  spannable: Positionable,
  options?: AssertFootprintOptions,
): Promise<void> {
  const entities = await getPositionedEntitiesOnGrid(prisma, authorId);
  const excluded = toExcludeList(options?.excludePosition);
  const entitiesForCheck =
    excluded.length === 0 ? entities : entities.filter((entity) => !isExcluded(entity, excluded));

  if (!structureFootprintFits(spannable, GROUND_WIDTH, GROUND_HEIGHT, entitiesForCheck)) {
    throw new AppError(400, "Position is not free");
  }
}

export async function requireNearestEmpty(authorId: string, near: Positionable): Promise<Position> {
  return findNearestEmptyPositionForAuthor(prisma, authorId, near);
}
