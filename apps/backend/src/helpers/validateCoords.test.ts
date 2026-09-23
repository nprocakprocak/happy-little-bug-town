import { describe, expect, it } from "vitest";

import { getValidCoords } from "./validateCoords.js";

describe("getValidCoords", () => {
  it("returns integer coordinates", () => {
    expect(getValidCoords(0, -3)).toEqual({ x: 0, y: -3 });
    expect(getValidCoords(4, 9)).toEqual({ x: 4, y: 9 });
  });

  it("rejects non-integers and non-numbers", () => {
    expect(getValidCoords(1.5, 2)).toBeNull();
    expect(getValidCoords(Number.NaN, 2)).toBeNull();
    expect(getValidCoords(Number.POSITIVE_INFINITY, 2)).toBeNull();
    expect(getValidCoords("1", 2)).toBeNull();
    expect(getValidCoords(1, null)).toBeNull();
    expect(getValidCoords(undefined, 1)).toBeNull();
  });
});
