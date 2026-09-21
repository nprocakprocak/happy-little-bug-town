import {
  BugType,
  findNearestEmptyPosition,
  GROUND_HEIGHT,
  GROUND_WIDTH,
  ItemType,
  Position,
  Positionable,
} from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { prisma } from "../lib/prisma.js";

type GridDb = Pick<typeof prisma, "structure" | "item" | "stack" | "bug">;

export async function lockAuthorGrid(
  tx: Pick<typeof prisma, "$executeRaw">,
  authorId: string,
): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${authorId}))`;
}

function toPositionedItem(item: {
  x: number | null;
  y: number | null;
  itemType: ItemType;
}): Positionable | undefined {
  if (item.x == null || item.y == null) {
    return undefined;
  }
  return { x: item.x, y: item.y, itemType: item.itemType };
}

function toPositionedBug(bug: {
  x: number | null;
  y: number | null;
  bugType: BugType;
}): Positionable | undefined {
  if (bug.x == null || bug.y == null) {
    return undefined;
  }
  return { x: bug.x, y: bug.y, bugType: bug.bugType };
}

export async function getPositionedEntitiesOnGrid(
  db: GridDb,
  authorId: string,
): Promise<Positionable[]> {
  const [structures, items, stacks, bugs] = await Promise.all([
    db.structure.findMany({
      where: { authorId, removedAt: null },
      select: { x: true, y: true, structureType: true },
    }),
    db.item.findMany({
      where: {
        authorId,
        x: { not: null },
        y: { not: null },
        removedAt: null,
      },
      select: { x: true, y: true, itemType: true },
    }),
    db.stack.findMany({
      where: { authorId },
      select: { x: true, y: true, itemType: true },
    }),
    db.bug.findMany({
      where: {
        authorId,
        x: { not: null },
        y: { not: null },
        removedAt: null,
      },
      select: { x: true, y: true, bugType: true },
    }),
  ]);

  return [
    ...structures,
    ...items.flatMap((item) => {
      const positioned = toPositionedItem(item);
      return positioned ? [positioned] : [];
    }),
    ...stacks.map((stack) => ({
      x: stack.x,
      y: stack.y,
      itemsCount: 1,
      itemType: stack.itemType,
    })),
    ...bugs.flatMap((bug) => {
      const positioned = toPositionedBug(bug);
      return positioned ? [positioned] : [];
    }),
  ];
}

export async function getOwnedDiggableInventory(
  db: GridDb,
  authorId: string,
): Promise<{ items: { itemType: ItemType }[]; bugs: { bugType: BugType }[] }> {
  const [items, bugs] = await Promise.all([
    db.item.findMany({
      where: {
        authorId,
        removedAt: null,
        OR: [{ x: { not: null }, y: { not: null } }, { stackId: { not: null } }],
      },
      select: { itemType: true },
    }),
    db.bug.findMany({
      where: {
        authorId,
        removedAt: null,
        OR: [{ x: { not: null }, y: { not: null } }, { structureId: { not: null } }],
      },
      select: { bugType: true },
    }),
  ]);

  return { items, bugs };
}

export async function findNearestEmptyPositionForAuthor(
  near: Positionable,
  entities: Positionable[],
): Promise<Position> {
  const emptyPosition = findNearestEmptyPosition(GROUND_HEIGHT, GROUND_WIDTH, entities, near);
  if (!emptyPosition) {
    throw new AppError(400, "No empty position found");
  }
  return emptyPosition;
}
