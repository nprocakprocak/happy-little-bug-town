import { describe, expect, it } from "vitest";
import { ItemForCraft } from "../items/craft.js";
import { BugType } from "../types/bugType.js";
import {
  canDemolishStructure,
  canDemolishStructureType,
  isSelfGeneratingHouse,
} from "./demolition.js";

function craftedHammer(): ItemForCraft {
  return {
    itemType: "hammer",
    items: [{ itemType: "brick" }, { itemType: "wood" }, { itemType: "root" }, { itemType: "root" }],
  };
}

function bugs(bugType: BugType, count: number): { id: string; bugType: BugType }[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${bugType}-${index}`,
    bugType,
  }));
}

describe("structure demolition", () => {
  it("treats a house as self-generating once it holds an infinite source of its bugs", () => {
    expect(
      isSelfGeneratingHouse({
        structureType: "beetle_house",
        bugs: bugs("beetle", 10),
      }),
    ).toBe(true);
    expect(
      isSelfGeneratingHouse({
        structureType: "greenfly_house",
        bugs: bugs("greenfly", 10),
      }),
    ).toBe(true);
    expect(
      isSelfGeneratingHouse({
        structureType: "greenfly_house",
        bugs: bugs("beetle", 10),
      }),
    ).toBe(false);
    expect(
      isSelfGeneratingHouse({
        structureType: "workshop",
        bugs: bugs("beetle", 10),
      }),
    ).toBe(false);
  });

  it("requires a crafted hammer and refuses ground and self-generating structures", () => {
    const hammer = [craftedHammer()];
    const unfinishedHammer: ItemForCraft[] = [{ itemType: "hammer", items: [] }];

    expect(canDemolishStructureType("workshop", hammer)).toBe(true);
    expect(canDemolishStructureType("workshop", unfinishedHammer)).toBe(false);
    expect(canDemolishStructureType("workshop", [])).toBe(false);
    expect(canDemolishStructureType("hole", hammer)).toBe(false);

    expect(
      canDemolishStructure({ structureType: "beetle_house", bugs: bugs("beetle", 1) }, hammer),
    ).toBe(true);
    expect(
      canDemolishStructure(
        { structureType: "beetle_house", bugs: bugs("beetle", 10) },
        hammer,
      ),
    ).toBe(false);
  });
});
