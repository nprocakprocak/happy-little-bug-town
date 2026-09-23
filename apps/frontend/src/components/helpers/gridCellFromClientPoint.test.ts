// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import { gridCellFromClientPoint } from "./gridCellFromClientPoint";

function grid(width: number, height: number, columnGap = "0px", rowGap = "0px"): HTMLElement {
  const container = document.createElement("div");
  container.getBoundingClientRect = () => new DOMRect(0, 0, width, height);
  vi.spyOn(window, "getComputedStyle").mockImplementation(() => {
    const style = document.createElement("div").style;
    style.columnGap = columnGap;
    style.rowGap = rowGap;
    style.gap = "0px";
    return style;
  });
  return container;
}

describe("grid cell from a client point", () => {
  it("returns the cell under the pointer", () => {
    const container = grid(100, 40);

    expect(gridCellFromClientPoint(container, 10, 5, 2, 2)).toEqual({ x: 1, y: 1 });
    expect(gridCellFromClientPoint(container, 60, 25, 2, 2)).toEqual({ x: 2, y: 2 });
  });

  it("snaps a point outside every cell to the nearest center", () => {
    const container = grid(100, 40);

    expect(gridCellFromClientPoint(container, 100, 0, 2, 1)).toEqual({ x: 2, y: 1 });
  });

  it("keeps the earlier cell when a gap point is equally close to two centers", () => {
    const container = grid(110, 20, "10px");

    expect(gridCellFromClientPoint(container, 55, 5, 2, 1)).toEqual({ x: 1, y: 1 });
  });
});
