import { describe, expect, it } from "vitest";
import { isBuildableStructureType, isFarmBuildableStructureType } from "./buildable.js";

describe("buildable structure types", () => {
  it("recognises structures that can be built", () => {
    expect(isBuildableStructureType("workshop")).toBe(true);
    expect(isBuildableStructureType("mushrooms_field")).toBe(true);
    expect(isBuildableStructureType("hole")).toBe(false);
    expect(isBuildableStructureType("unknown")).toBe(false);
    expect(isBuildableStructureType(1)).toBe(false);
  });

  it("recognises farm structures separately", () => {
    expect(isFarmBuildableStructureType("flowers_field")).toBe(true);
    expect(isFarmBuildableStructureType("composter")).toBe(true);
    expect(isFarmBuildableStructureType("farm")).toBe(false);
    expect(isFarmBuildableStructureType("workshop")).toBe(false);
  });
});
