import { describe, expect, it } from "vitest";

import { structureTypeToImage } from "./structureImages";

describe("structure images", () => {
  it("uses the base sprite at level zero", () => {
    expect(structureTypeToImage("hole")).toBe("/structures/hole.webp");
    expect(structureTypeToImage("workshop")).toBe("/structures/workshop.webp");
    expect(structureTypeToImage("flowers_field")).toBe("/items/flower-bed.webp");
  });

  it("switches to the upgraded sprite for the reached level", () => {
    expect(structureTypeToImage("workshop", 1)).toBe("/structures/workshop-lvl-2.webp");
    expect(structureTypeToImage("workshop", 2)).toBe("/structures/workshop-lvl-3.webp");
    expect(structureTypeToImage("stonemason", 2)).toBe("/structures/stonemason-lvl-3.webp");
    expect(structureTypeToImage("woodcutter", 1)).toBe("/structures/woodcutter-lvl-2.webp");
    expect(structureTypeToImage("kitchen", 1)).toBe("/structures/field-kitchen-lvl-2.webp");
    expect(structureTypeToImage("smelter", 1)).toBe("/structures/smelter-lvl-2.webp");
    expect(structureTypeToImage("tavern", 1)).toBe("/structures/tavern.webp");
  });
});
