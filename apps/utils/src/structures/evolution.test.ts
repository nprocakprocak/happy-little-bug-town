import { describe, expect, it } from "vitest";
import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";
import {
  canDigAtStructureType,
  canStructureAcceptEvolutionBugDrop,
  getEvolutionOccupancyProgress,
  getEvolutionOccupantCount,
  getEvolutionStepFromType,
  getReachedGroundBackgroundId,
  getVisibleGroundBackgroundId,
  isGroundEvolutionStructureType,
  isStructureReadyToEvolve,
} from "./evolution.js";

function occupants(structureType: StructureType, bugType: BugType, count: number) {
  return {
    structureType,
    bugs: Array.from({ length: count }, () => ({ bugType })),
  };
}

describe("structure evolution", () => {
  it("recognises ground structures that can be dug and evolved", () => {
    expect(isGroundEvolutionStructureType("anthill")).toBe(true);
    expect(isGroundEvolutionStructureType("workshop")).toBe(false);
    expect(canDigAtStructureType("hole")).toBe(true);
    expect(canDigAtStructureType("farm")).toBe(false);
    expect(getEvolutionStepFromType("hole")?.toType).toBe("anthill");
    expect(getEvolutionStepFromType("beehive")).toBeUndefined();
  });

  it("counts only the occupant bug and reports progress once at least one is present", () => {
    const hole = occupants("hole", "ant", 1);
    hole.bugs.push({ bugType: "beetle" });

    expect(getEvolutionOccupantCount(hole)).toBe(1);
    expect(getEvolutionOccupancyProgress(hole)).toEqual({
      count: 1,
      max: 3,
      bugType: "ant",
    });
    expect(getEvolutionOccupancyProgress(occupants("hole", "beetle", 2))).toBeNull();
    expect(getEvolutionOccupancyProgress(occupants("workshop", "ant", 3))).toBeNull();
  });

  it("accepts occupant bugs until the structure is ready to evolve", () => {
    const twoAnts = occupants("hole", "ant", 2);
    const threeAnts = occupants("hole", "ant", 3);

    expect(canStructureAcceptEvolutionBugDrop({ bugType: "ant" }, twoAnts)).toBe(true);
    expect(canStructureAcceptEvolutionBugDrop({ bugType: "termite" }, twoAnts)).toBe(false);
    expect(canStructureAcceptEvolutionBugDrop({ bugType: "ant" }, threeAnts)).toBe(false);
    expect(isStructureReadyToEvolve(twoAnts)).toBe(false);
    expect(isStructureReadyToEvolve(threeAnts)).toBe(true);
    expect(isStructureReadyToEvolve(occupants("beehive", "bee", 3))).toBe(false);
  });

  it("picks the furthest reached ground background", () => {
    expect(getReachedGroundBackgroundId(["hole"])).toBe("sand");
    expect(getReachedGroundBackgroundId(["anthill"])).toBe("sandy_soil");
    expect(getReachedGroundBackgroundId(["anthill", "beehive"])).toBe("grass");
  });

  it("keeps the previous background until the evolution fade starts", () => {
    expect(getVisibleGroundBackgroundId("sand", null, false)).toBe("sand");
    expect(getVisibleGroundBackgroundId("sand", undefined, true)).toBe("sand");
    expect(getVisibleGroundBackgroundId("sand", "anthill", false)).toBe("sand");
    expect(getVisibleGroundBackgroundId("sand", "anthill", true)).toBe("sandy_soil");
    expect(getVisibleGroundBackgroundId("sandy_soil", "termite_mound", false)).toBe("sandy_soil");
    expect(getVisibleGroundBackgroundId("sandy_soil", "termite_mound", true)).toBe("fertile_soil");
    expect(getVisibleGroundBackgroundId("sand", "workshop", true)).toBe("sand");
  });
});
