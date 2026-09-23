import { beforeEach, describe, expect, it, vi } from "vitest";

import { GROUND_HEIGHT, GROUND_WIDTH, Positionable } from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import {
  findNearestEmptyPositionForAuthor,
  getOwnedDiggableInventory,
  getPositionedEntitiesOnGrid,
  lockAuthorGrid,
} from "./gridPlacement.js";

vi.mock("../lib/prisma.js", () => ({
  prisma: {},
}));

interface FindMany {
  findMany: ReturnType<typeof vi.fn>;
}

function gridDb(): {
  structure: FindMany;
  item: FindMany;
  stack: FindMany;
  bug: FindMany;
} {
  return {
    structure: { findMany: vi.fn() },
    item: { findMany: vi.fn() },
    stack: { findMany: vi.fn() },
    bug: { findMany: vi.fn() },
  };
}

type GridDb = Parameters<typeof getPositionedEntitiesOnGrid>[0];

describe("grid placement helpers", () => {
  const db = gridDb();

  beforeEach(() => {
    db.structure.findMany.mockReset();
    db.item.findMany.mockReset();
    db.stack.findMany.mockReset();
    db.bug.findMany.mockReset();
  });

  it("locks the author grid with a transaction advisory lock", async () => {
    const values: unknown[] = [];
    const tx = {
      $executeRaw: async (query: TemplateStringsArray, ...params: unknown[]) => {
        values.push(query.join("?"), ...params);
        return 0;
      },
    };

    await lockAuthorGrid(tx as unknown as Parameters<typeof lockAuthorGrid>[0], "author-1");

    expect(values).toEqual(["SELECT pg_advisory_xact_lock(hashtext(?))", "author-1"]);
  });

  it("collects positioned structures, items, stacks, and bugs", async () => {
    db.structure.findMany.mockResolvedValue([{ x: 1, y: 1, structureType: "workshop" }]);
    db.item.findMany.mockResolvedValue([
      { x: 4, y: 5, itemType: "stick" },
      { x: null, y: 6, itemType: "root" },
      { x: 7, y: null, itemType: "leaf_part" },
    ]);
    db.stack.findMany.mockResolvedValue([{ x: 8, y: 2, itemType: "little_rock" }]);
    db.bug.findMany.mockResolvedValue([
      { x: 3, y: 3, bugType: "ant" },
      { x: null, y: null, bugType: "beetle" },
    ]);

    await expect(getPositionedEntitiesOnGrid(db as unknown as GridDb, "author-1")).resolves.toEqual(
      [
        { x: 1, y: 1, structureType: "workshop" },
        { x: 4, y: 5, itemType: "stick" },
        { x: 8, y: 2, itemsCount: 1, itemType: "little_rock" },
        { x: 3, y: 3, bugType: "ant" },
      ],
    );
    expect(db.structure.findMany).toHaveBeenCalledWith({
      where: { authorId: "author-1", removedAt: null },
      select: { x: true, y: true, structureType: true },
    });
  });

  it("returns the author's placed items and housed bugs", async () => {
    const items = [{ itemType: "stick" }];
    const bugs = [{ bugType: "ant" }];
    db.item.findMany.mockResolvedValue(items);
    db.bug.findMany.mockResolvedValue(bugs);

    await expect(getOwnedDiggableInventory(db as unknown as GridDb, "author-1")).resolves.toEqual({
      items,
      bugs,
    });
    expect(db.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ authorId: "author-1", removedAt: null }),
        select: { itemType: true },
      }),
    );
    expect(db.bug.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ authorId: "author-1", removedAt: null }),
        select: { bugType: true },
      }),
    );
  });

  it("returns the nearest empty cell or rejects a full grid", async () => {
    const near: Positionable = { x: 1, y: 1, bugType: "ant" };

    await expect(findNearestEmptyPositionForAuthor(near, [near])).resolves.toEqual({ x: 1, y: 2 });

    const occupied: Positionable[] = [];
    for (let y = 1; y <= GROUND_HEIGHT; y += 1) {
      for (let x = 1; x <= GROUND_WIDTH; x += 1) {
        occupied.push({ x, y, bugType: "ant" });
      }
    }

    await expect(findNearestEmptyPositionForAuthor(near, occupied)).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(findNearestEmptyPositionForAuthor(near, occupied)).rejects.toMatchObject({
      status: 400,
      message: "No empty position found",
    });
  });
});
