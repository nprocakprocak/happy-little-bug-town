import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";
import { isStructureBuilt, StructureForBuild } from "./build.js";

const STRUCTURE_TERMITE_CAPACITY = 1;
const ASSIGNED_TERMITE_BUG_TYPE: BugType = "termite";

const TERMITE_ASSIGNABLE_STRUCTURE_TYPES: Set<StructureType> = new Set([
  "stonemason",
  "woodcutter",
  "kitchen",
  "tavern",
  "smelter",
  "mushrooms_field",
]);

interface BugForTermiteAssignment {
  bugType: BugType;
}

interface StructureForTermiteAssignment {
  structureType: StructureType;
  bugs: BugForTermiteAssignment[];
}

export function isTermiteAssignableStructureType(
  structureType: StructureType,
): boolean {
  return TERMITE_ASSIGNABLE_STRUCTURE_TYPES.has(structureType);
}

export function hasStructureAssignedTermite(
  structure: StructureForTermiteAssignment,
): boolean {
  return structure.bugs.some(
    (bug) => bug.bugType === ASSIGNED_TERMITE_BUG_TYPE,
  );
}

export function getStructureAssignedTermiteCount(
  structure: StructureForTermiteAssignment,
): number {
  return structure.bugs.filter(
    (bug) => bug.bugType === ASSIGNED_TERMITE_BUG_TYPE,
  ).length;
}

export function canStructureAcceptAssignedTermite(
  bug: BugForTermiteAssignment,
  structure: StructureForBuild & StructureForTermiteAssignment,
): boolean {
  return (
    bug.bugType === ASSIGNED_TERMITE_BUG_TYPE &&
    isTermiteAssignableStructureType(structure.structureType) &&
    isStructureBuilt(structure) &&
    getStructureAssignedTermiteCount(structure) < STRUCTURE_TERMITE_CAPACITY
  );
}
