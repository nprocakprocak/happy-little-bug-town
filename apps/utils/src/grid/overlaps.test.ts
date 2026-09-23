import { describe, expect, it } from "vitest";
import { Positionable } from "../types/positionable.js";
import {
  findOverlappingEntity,
  getSpannableSpan,
  positionOverlapsAnyEntity,
  structureFootprintFits,
} from "./overlaps.js";

describe("grid overlaps", () => {
  const bug: Positionable = { x: 2, y: 3, bugType: "ant" };
  const hole: Positionable = { x: 1, y: 1, structureType: "hole" };
  const stack: Positionable = { x: 5, y: 5, itemsCount: 4 };

  it("resolves a span from the entity kind", () => {
    expect(getSpannableSpan({ structureType: "workshop" })).toBe(3);
    expect(getSpannableSpan({ structureType: "hole" })).toBe(2);
    expect(getSpannableSpan({ itemsCount: 1 })).toBe(2);
    expect(getSpannableSpan({ itemType: "leaf_rake" })).toBe(2);
    expect(getSpannableSpan({ itemType: "stick" })).toBe(1);
    expect(getSpannableSpan({ bugType: "bee" })).toBe(1);
  });

  it("detects a cell inside a multi-cell footprint", () => {
    expect(positionOverlapsAnyEntity({ x: 2, y: 2 }, [hole, bug])).toBe(true);
    expect(positionOverlapsAnyEntity({ x: 3, y: 1 }, [hole])).toBe(false);
    expect(findOverlappingEntity({ x: 2, y: 3 }, [hole, bug])).toBe(bug);
    expect(findOverlappingEntity({ x: 4, y: 4 }, [hole, bug])).toBeUndefined();
    expect(positionOverlapsAnyEntity({ x: 6, y: 6 }, [stack])).toBe(true);
    expect(positionOverlapsAnyEntity({ x: 7, y: 5 }, [stack])).toBe(false);
  });

  it("accepts a footprint that stays inside the grid and clear of other entities", () => {
    expect(structureFootprintFits(hole, 10, 10, [])).toBe(true);
  });

  it("rejects a footprint that leaves the grid or covers another entity", () => {
    expect(structureFootprintFits({ x: 0, y: 1, structureType: "hole" }, 10, 10, [])).toBe(false);
    expect(structureFootprintFits({ x: 1, y: 0, structureType: "hole" }, 10, 10, [])).toBe(false);
    expect(structureFootprintFits({ x: 10, y: 1, structureType: "hole" }, 10, 10, [])).toBe(false);
    expect(structureFootprintFits({ x: 9, y: 1, structureType: "hole" }, 10, 10, [])).toBe(true);
    expect(structureFootprintFits(hole, 10, 10, [{ x: 2, y: 2, bugType: "beetle" }])).toBe(false);
  });
});
