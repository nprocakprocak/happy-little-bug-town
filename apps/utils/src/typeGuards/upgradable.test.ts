import { describe, expect, it } from "vitest";
import { isUpgradableStructureType } from "./upgradable.js";

describe("upgradable structure types", () => {
  it("recognises structures that have upgrade recipes", () => {
    expect(isUpgradableStructureType("workshop")).toBe(true);
    expect(isUpgradableStructureType("smelter")).toBe(true);
    expect(isUpgradableStructureType("tavern")).toBe(false);
    expect(isUpgradableStructureType("beetle_house")).toBe(false);
    expect(isUpgradableStructureType(null)).toBe(false);
  });
});
