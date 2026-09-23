import { describe, expect, it } from "vitest";

import { GROUND_GRID_MAX_WIDTH_PX } from "../../constants/layout";
import { Bug } from "../../types/bug";
import {
  footprintBottomRightCell,
  gridDragStyle,
  gridImageSizes,
  gridPlacementStyle,
  groundGridTemplateStyle,
  spanCellGridPosition,
} from "./groundGridStyles";

describe("ground grid styles", () => {
  it("sizes an image from the max grid width, columns, and span", () => {
    expect(gridImageSizes(10, 1)).toBe(`${Math.ceil(GROUND_GRID_MAX_WIDTH_PX / 10)}px`);
    expect(gridImageSizes(10, 2)).toBe("90px");
  });

  it("builds equal column and row tracks", () => {
    expect(groundGridTemplateStyle(10, 18)).toEqual({
      gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
      gridTemplateRows: "repeat(18, minmax(0, 1fr))",
    });
  });

  it("places a single cell by number and a wider footprint by span", () => {
    expect(gridPlacementStyle(3, 4)).toEqual({ gridColumn: 3, gridRow: 4 });
    expect(gridPlacementStyle(3, 4, 1)).toEqual({ gridColumn: 3, gridRow: 4 });
    expect(gridPlacementStyle(3, 4, 2)).toEqual({
      gridColumn: "3 / span 2",
      gridRow: "4 / span 2",
    });
  });

  it("maps a span index onto the footprint and its bottom-right cell", () => {
    expect(spanCellGridPosition(2, 5, 2, 0)).toEqual({ gridColumn: 2, gridRow: 5 });
    expect(spanCellGridPosition(2, 5, 2, 3)).toEqual({ gridColumn: 3, gridRow: 6 });
    expect(footprintBottomRightCell(2, 5, 2)).toEqual({ col: 3, row: 6 });
  });

  it("translates a dragged cell and leaves settled cells alone", () => {
    const entity: Bug = { id: "ant", x: 1, y: 1, bugType: "ant", items: [] };

    expect(gridDragStyle(null, true)).toEqual({});
    expect(gridDragStyle({ dx: 4, dy: 8, entity }, false)).toEqual({});
    expect(gridDragStyle({ dx: 4, dy: 8, entity }, true)).toEqual({
      transform: "translate(4px, 8px)",
      zIndex: 5,
    });
  });
});
