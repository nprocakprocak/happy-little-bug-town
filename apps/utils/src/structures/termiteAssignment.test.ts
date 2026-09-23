import { describe, expect, it } from "vitest";
import { BugType } from "../types/bugType.js";
import { ItemType } from "../types/itemType.js";
import { StructureForBuild } from "./build.js";
import {
  canStructureAcceptAssignedTermite,
  getAssignedTermiteCapacity,
  getStructureAssignedTermiteCount,
  hasStructureAssignedTermite,
  isTermiteAssignableStructureType,
} from "./termiteAssignment.js";

function copies(itemType: ItemType, count: number): { itemType: ItemType }[] {
  return Array.from({ length: count }, () => ({ itemType }));
}

describe("termite assignment", () => {
  const builtKitchen: StructureForBuild & { bugs: { bugType: BugType }[] } = {
    structureType: "kitchen",
    bugs: [],
    items: [...copies("leaf_part", 2), ...copies("brick", 1), ...copies("wood", 2)],
  };

  it("reserves one termite on production structures", () => {
    expect(isTermiteAssignableStructureType("kitchen")).toBe(true);
    expect(isTermiteAssignableStructureType("workshop")).toBe(false);
    expect(getAssignedTermiteCapacity("library")).toBe(1);
    expect(getAssignedTermiteCapacity("farm")).toBe(0);
  });

  it("accepts a termite only on a built structure that does not already have one", () => {
    expect(hasStructureAssignedTermite(builtKitchen)).toBe(false);
    expect(getStructureAssignedTermiteCount(builtKitchen)).toBe(0);
    expect(canStructureAcceptAssignedTermite({ bugType: "termite" }, builtKitchen)).toBe(true);
    expect(canStructureAcceptAssignedTermite({ bugType: "ant" }, builtKitchen)).toBe(false);
    expect(
      canStructureAcceptAssignedTermite({ bugType: "termite" }, { ...builtKitchen, items: [] }),
    ).toBe(false);

    const termite: { bugType: BugType } = { bugType: "termite" };
    const staffed = { ...builtKitchen, bugs: [termite] };
    expect(hasStructureAssignedTermite(staffed)).toBe(true);
    expect(getStructureAssignedTermiteCount(staffed)).toBe(1);
    expect(canStructureAcceptAssignedTermite({ bugType: "termite" }, staffed)).toBe(false);
  });
});
