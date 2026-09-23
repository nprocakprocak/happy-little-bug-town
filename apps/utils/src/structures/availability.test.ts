import { describe, expect, it } from "vitest";
import { StructureType } from "../types/structureType.js";
import { hasStructureType } from "./availability.js";

describe("structure availability", () => {
  const structures: { structureType: StructureType }[] = [
    { structureType: "workshop" },
    { structureType: "hole" },
  ];

  it("finds a structure type in a list", () => {
    expect(hasStructureType(structures, "hole")).toBe(true);
    expect(hasStructureType(structures, "tavern")).toBe(false);
  });
});
