import { describe, expect, it } from "vitest";
import { BugType } from "../types/bugType.js";
import {
  getGreenflyHouseOccupants,
  getHouseOccupants,
  getHouseSourceBugType,
} from "./greenflyHouse.js";

describe("bug houses", () => {
  const mixedBugs: { id: string; bugType: BugType }[] = [
    { id: "beetle-1", bugType: "beetle" },
    { id: "greenfly-1", bugType: "greenfly" },
  ];

  it("returns the bug type produced by a house", () => {
    expect(getHouseSourceBugType("beetle_house")).toBe("beetle");
    expect(getHouseSourceBugType("greenfly_house")).toBe("greenfly");
    expect(getHouseSourceBugType("workshop")).toBeNull();
  });

  it("lists beetle house occupants as every bug and greenfly house occupants as greenflies", () => {
    expect(getHouseOccupants({ structureType: "beetle_house", bugs: mixedBugs })).toEqual(mixedBugs);
    expect(getGreenflyHouseOccupants({ structureType: "greenfly_house", bugs: mixedBugs })).toEqual([
      mixedBugs[1],
    ]);
    expect(getHouseOccupants({ structureType: "greenfly_house", bugs: mixedBugs })).toEqual([
      mixedBugs[1],
    ]);
    expect(getGreenflyHouseOccupants({ structureType: "beetle_house", bugs: mixedBugs })).toEqual([]);
    expect(getHouseOccupants({ structureType: "workshop", bugs: mixedBugs })).toEqual([]);
  });
});
