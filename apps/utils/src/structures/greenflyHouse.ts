import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";

export function getGreenflyHouseOccupants<T extends { id: string; bugType: BugType }>(
  structure: { structureType: StructureType; bugs: T[] },
): T[] {
  if (structure.structureType !== "greenfly_house") {
    return [];
  }

  return structure.bugs.filter((bug) => bug.bugType === "greenfly");
}

export function getHouseOccupants<T extends { id: string; bugType: BugType }>(
  structure: { structureType: StructureType; bugs: T[] },
): T[] {
  if (structure.structureType === "beetle_house") {
    return structure.bugs;
  }

  return getGreenflyHouseOccupants(structure);
}
