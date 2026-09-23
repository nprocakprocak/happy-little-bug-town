import { beforeEach, describe, expect, it, vi } from "vitest";

import { Positionable } from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { assertFootprintFits, requireCoords, requireNearestEmpty } from "./placement.js";

const { getPositionedEntitiesOnGrid, findNearestEmptyPositionForAuthor } = vi.hoisted(() => ({
  getPositionedEntitiesOnGrid: vi.fn(),
  findNearestEmptyPositionForAuthor: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: { mocked: true },
}));

vi.mock("./gridPlacement.js", () => ({
  getPositionedEntitiesOnGrid,
  findNearestEmptyPositionForAuthor,
}));

describe("placement", () => {
  const hole: Positionable = { x: 1, y: 1, structureType: "hole" };
  const bug: Positionable = { x: 4, y: 4, bugType: "ant" };

  beforeEach(() => {
    getPositionedEntitiesOnGrid.mockReset();
    findNearestEmptyPositionForAuthor.mockReset();
  });

  it("requires integer coordinates", () => {
    expect(requireCoords(2, 3)).toEqual({ x: 2, y: 3 });
    expect(() => requireCoords("2", 3)).toThrow(AppError);
    expect(() => requireCoords("2", 3)).toThrow("x and y are required");
  });

  it("rejects a footprint that leaves the grid or overlaps another entity", async () => {
    getPositionedEntitiesOnGrid.mockResolvedValue([hole, bug]);

    await expect(
      assertFootprintFits("author-1", { x: 0, y: 1, bugType: "ant" }),
    ).rejects.toMatchObject({ status: 400, message: "Position is not free" });
    await expect(
      assertFootprintFits("author-1", { x: 1, y: 1, bugType: "ant" }),
    ).rejects.toMatchObject({ status: 400, message: "Position is not free" });
    await expect(
      assertFootprintFits("author-1", { x: 3, y: 1, bugType: "ant" }),
    ).resolves.toBeUndefined();
  });

  it("ignores excluded origins when checking the footprint", async () => {
    getPositionedEntitiesOnGrid.mockResolvedValue([hole, bug]);

    await expect(
      assertFootprintFits(
        "author-1",
        { x: 1, y: 1, structureType: "hole" },
        { excludePosition: hole },
      ),
    ).resolves.toBeUndefined();
    await expect(
      assertFootprintFits(
        "author-1",
        { x: 4, y: 4, bugType: "beetle" },
        { excludePosition: [bug, hole] },
      ),
    ).resolves.toBeUndefined();
    await expect(
      assertFootprintFits("author-1", { x: 2, y: 2, bugType: "ant" }, { excludePosition: bug }),
    ).rejects.toMatchObject({ status: 400, message: "Position is not free" });
  });

  it("asks for the nearest empty cell among the author's entities", async () => {
    const entities = [bug];
    getPositionedEntitiesOnGrid.mockResolvedValue(entities);
    findNearestEmptyPositionForAuthor.mockResolvedValue({ x: 5, y: 6 });

    await expect(requireNearestEmpty("author-1", hole)).resolves.toEqual({ x: 5, y: 6 });
    expect(getPositionedEntitiesOnGrid).toHaveBeenCalledWith({ mocked: true }, "author-1");
    expect(findNearestEmptyPositionForAuthor).toHaveBeenCalledWith(hole, entities);
  });
});
