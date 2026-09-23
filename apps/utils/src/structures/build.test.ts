import { describe, expect, it } from "vitest";
import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import {
  canAcceptItemForBuild,
  getBuildResourceCosts,
  getBuildResourceCostsForType,
  getStructureBuildProgress,
  isStructureBuilt,
  isStructureIncomplete,
} from "./build.js";

function ofType(itemType: ItemType, count: number): { itemType: ItemType }[] {
  return Array.from({ length: count }, () => ({ itemType }));
}

function workshop(items: { itemType: ItemType }[]): {
  structureType: StructureType;
  items: { itemType: ItemType }[];
} {
  return { structureType: "workshop", items };
}

describe("structure build", () => {
  const workshopItems = [
    ...ofType("leaf_part", 3),
    ...ofType("little_rock", 2),
    ...ofType("stick", 1),
    ...ofType("root", 1),
  ];

  it("returns build costs only for buildable structures", () => {
    expect(getBuildResourceCosts("hole")).toBeUndefined();
    expect(getBuildResourceCosts("workshop")).toEqual(getBuildResourceCostsForType("workshop"));
    expect(getBuildResourceCostsForType("beetle_house")[0]).toEqual({
      itemType: "leaf_part",
      count: 2,
    });
  });

  it("treats ground evolution structures as built without items", () => {
    const hole: { structureType: StructureType; items: { itemType: ItemType }[] } = {
      structureType: "hole",
      items: [],
    };

    expect(isStructureBuilt(hole)).toBe(true);
    expect(isStructureIncomplete(hole)).toBe(false);
    expect(getStructureBuildProgress(hole)).toEqual([]);
    expect(canAcceptItemForBuild(hole, "leaf_part")).toBe(false);
  });

  it("tracks missing build materials until the structure is complete", () => {
    const incomplete = workshop(ofType("leaf_part", 2));

    expect(isStructureBuilt(incomplete)).toBe(false);
    expect(isStructureIncomplete(incomplete)).toBe(true);
    expect(getStructureBuildProgress(incomplete)[0]).toEqual({
      itemType: "leaf_part",
      supplied: 2,
      required: 3,
      missing: 1,
    });
    expect(canAcceptItemForBuild(incomplete, "leaf_part")).toBe(true);
    expect(canAcceptItemForBuild(incomplete, "wood")).toBe(false);
  });

  it("stops accepting build items once every cost is covered", () => {
    const built = workshop(workshopItems);

    expect(isStructureBuilt(built)).toBe(true);
    expect(canAcceptItemForBuild(built, "leaf_part")).toBe(false);
  });
});
