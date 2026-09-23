import { describe, expect, it } from "vitest";

import { structureTypeToDescription } from "./structureDescription";

describe("structure descriptions", () => {
  it("describes buildable workshops and houses", () => {
    expect(structureTypeToDescription("workshop")).toBe("Allows to craft useful tools");
    expect(structureTypeToDescription("beetle_house")).toBe("All beetles can be dropped here");
    expect(structureTypeToDescription("town_hall")).toBe("Attracts bees");
  });

  it("leaves ground and fields without a build blurb", () => {
    expect(structureTypeToDescription("hole")).toBeUndefined();
    expect(structureTypeToDescription("mushrooms_field")).toBeUndefined();
    expect(structureTypeToDescription("beehive")).toBeUndefined();
  });
});
