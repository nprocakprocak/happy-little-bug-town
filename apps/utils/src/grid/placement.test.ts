import { describe, expect, it } from "vitest";
import { Positionable } from "../types/positionable.js";
import {
  findFirstStructurePlacement,
  findNearestEmptyPosition,
  hasEmptyGridCell,
} from "./placement.js";

describe("grid placement", () => {
  it("returns the first free cell in row-major order", () => {
    const entities: Positionable[] = [{ x: 1, y: 1, bugType: "ant" }];

    expect(findFirstStructurePlacement({ itemType: "stick" }, 3, 3, entities)).toEqual({
      x: 2,
      y: 1,
    });
    expect(findFirstStructurePlacement({ itemType: "stick" }, 1, 1, entities)).toBeNull();
  });

  it("returns null when a larger footprint cannot fit around occupied cells", () => {
    const entities: Positionable[] = [{ x: 2, y: 2, bugType: "ant" }];

    expect(findFirstStructurePlacement({ structureType: "hole" }, 3, 3, entities)).toBeNull();
    expect(findFirstStructurePlacement({ structureType: "hole" }, 2, 2, [])).toEqual({
      x: 1,
      y: 1,
    });
  });

  it("reports whether any grid cell is empty", () => {
    const filled: Positionable[] = [
      { x: 1, y: 1, bugType: "ant" },
      { x: 2, y: 1, bugType: "ant" },
    ];

    expect(hasEmptyGridCell(1, 2, filled)).toBe(false);
    expect(hasEmptyGridCell(1, 2, [filled[0]])).toBe(true);
  });

  it("picks the closest empty cell, breaking ties by x and then y", () => {
    const near: Positionable = { x: 2, y: 2, bugType: "beetle" };
    const blocked: Positionable[] = [
      near,
      { x: 1, y: 1, bugType: "ant" },
      { x: 1, y: 2, bugType: "ant" },
      { x: 1, y: 3, bugType: "ant" },
      { x: 3, y: 1, bugType: "ant" },
      { x: 3, y: 2, bugType: "ant" },
      { x: 3, y: 3, bugType: "ant" },
    ];

    expect(findNearestEmptyPosition(3, 3, blocked, near)).toEqual({ x: 2, y: 1 });
    expect(
      findNearestEmptyPosition(1, 1, [{ x: 1, y: 1, bugType: "ant" }], {
        x: 1,
        y: 1,
        bugType: "ant",
      }),
    ).toBeUndefined();
  });

  it("prefers a closer cell over a later one", () => {
    const near: Positionable = { x: 1, y: 1, bugType: "ant" };

    expect(findNearestEmptyPosition(3, 3, [near], near)).toEqual({ x: 1, y: 2 });
  });
});
