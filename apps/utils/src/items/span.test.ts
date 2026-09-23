import { describe, expect, it } from "vitest";
import { ITEM_SPAN } from "../constants/game.js";
import { getItemSpan } from "./span.js";

describe("item span", () => {
  it("gives unique wide tools a 2-cell span", () => {
    expect(getItemSpan("leaf_rake")).toBe(2);
    expect(getItemSpan("wheelbarrel")).toBe(2);
    expect(getItemSpan("basket")).toBe(2);
    expect(getItemSpan("hammer")).toBe(2);
  });

  it("keeps every other item on one cell", () => {
    expect(getItemSpan("axe")).toBe(ITEM_SPAN);
    expect(getItemSpan("stick")).toBe(1);
    expect(getItemSpan("desk")).toBe(1);
  });
});
