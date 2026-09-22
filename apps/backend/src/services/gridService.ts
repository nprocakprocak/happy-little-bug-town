import { BugType, canSwapOnGrid, ItemType, Position } from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { lockAuthorGrid } from "../helpers/gridPlacement.js";
import { prisma } from "../lib/prisma.js";
import { isPositioned } from "../typeGuards/position.js";
import { BugDto } from "../types/bugDto.js";
import { ItemDto } from "../types/itemDto.js";
import { getBug } from "./bugsService.js";
import { getItem, isItemFreeOnGrid } from "./itemsService.js";

type GridOccupant =
  | { kind: "item"; id: string; x: number; y: number; itemType: ItemType; items: ItemDto["items"] }
  | { kind: "bug"; id: string; x: number; y: number; bugType: BugType };

function occupantFromItem(item: ItemDto): GridOccupant {
  if (!isPositioned(item) || !isItemFreeOnGrid(item)) {
    throw new AppError(400, "Entity is not on the grid");
  }
  return {
    kind: "item",
    id: item.id,
    x: item.x,
    y: item.y,
    itemType: item.itemType,
    items: item.items,
  };
}

function occupantFromBug(bug: BugDto): GridOccupant {
  if (!isPositioned(bug) || bug.stackId != null || bug.structureId != null) {
    throw new AppError(400, "Entity is not on the grid");
  }
  return { kind: "bug", id: bug.id, x: bug.x, y: bug.y, bugType: bug.bugType };
}

function occupantFromLoaded(
  item: ItemDto | null,
  bug: BugDto | null,
  authorId: string,
): GridOccupant {
  if (item && item.authorId === authorId) {
    return occupantFromItem(item);
  }
  if (bug && bug.authorId === authorId) {
    return occupantFromBug(bug);
  }
  throw new AppError(404, "Not found");
}

async function writeOccupantPosition(
  db: Pick<typeof prisma, "item" | "bug">,
  occupant: GridOccupant,
  position: Position,
): Promise<void> {
  if (occupant.kind === "item") {
    await db.item.update({
      where: { id: occupant.id },
      data: { x: position.x, y: position.y },
    });
    return;
  }

  await db.bug.update({
    where: { id: occupant.id },
    data: { x: position.x, y: position.y },
  });
}

export async function swapGridPositions(
  authorId: string,
  sourceId: string,
  targetId: string,
): Promise<{ source: { id: string } & Position; target: { id: string } & Position }> {
  if (sourceId === targetId) {
    throw new AppError(400, "Cannot swap an entity with itself");
  }

  const [sourceItem, sourceBug, targetItem, targetBug] = await Promise.all([
    getItem(sourceId),
    getBug(sourceId),
    getItem(targetId),
    getBug(targetId),
  ]);

  const source = occupantFromLoaded(sourceItem, sourceBug, authorId);
  const target = occupantFromLoaded(targetItem, targetBug, authorId);

  if (!canSwapOnGrid(source, target)) {
    throw new AppError(400, "Entities cannot be swapped");
  }

  const sourcePosition = { x: source.x, y: source.y };
  const targetPosition = { x: target.x, y: target.y };

  await prisma.$transaction(async (tx) => {
    await lockAuthorGrid(tx, authorId);
    await writeOccupantPosition(tx, source, targetPosition);
    await writeOccupantPosition(tx, target, sourcePosition);
  });

  return {
    source: { id: source.id, x: targetPosition.x, y: targetPosition.y },
    target: { id: target.id, x: sourcePosition.x, y: sourcePosition.y },
  };
}
