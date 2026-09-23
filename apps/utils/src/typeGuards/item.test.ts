import { describe, expect, it } from "vitest";
import { isItemType } from "./item.js";

describe("item types", () => {
  it("recognises known item types", () => {
    expect(isItemType("axe")).toBe(true);
    expect(isItemType("flower")).toBe(true);
    expect(isItemType("sword")).toBe(false);
    expect(isItemType(null)).toBe(false);
  });
});
