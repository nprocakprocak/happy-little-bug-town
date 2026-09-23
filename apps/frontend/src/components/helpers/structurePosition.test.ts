import { describe, expect, it, vi } from "vitest";

import { Structure } from "../../types/structure";
import {
  getBeetleHouseExtractOrigin,
  pickRandomNearestStructureCenterCell,
} from "./structurePosition";

function structure(structureType: Structure["structureType"], x: number, y: number): Structure {
  return {
    id: structureType,
    x,
    y,
    structureType,
    upgradeLevel: 0,
    items: [],
    bugs: [],
  };
}

describe("structure positions", () => {
  it("uses the middle cell of an odd footprint", () => {
    expect(pickRandomNearestStructureCenterCell(structure("workshop", 2, 3))).toEqual({
      x: 3,
      y: 4,
    });
  });

  it("picks one of the four center cells of an even footprint", () => {
    const random = vi.spyOn(Math, "random");
    const hole = structure("hole", 4, 5);

    random.mockReturnValue(0);
    expect(pickRandomNearestStructureCenterCell(hole)).toEqual({ x: 4, y: 5 });

    random.mockReturnValue(0.99);
    expect(pickRandomNearestStructureCenterCell(hole)).toEqual({ x: 5, y: 6 });

    random.mockRestore();
  });

  it("extracts from the bottom-right cell of a beetle house", () => {
    expect(getBeetleHouseExtractOrigin(structure("beetle_house", 2, 3))).toEqual({ x: 3, y: 4 });
  });
});
