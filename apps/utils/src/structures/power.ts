import { STRUCTURE_POWER_REQUIREMENTS } from "../constants/structurePowerRequirements.js";
import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";
import { isStructureBuilt, isStructureIncomplete, StructureForBuild } from "./build.js";

export interface StructureForPower {
  structureType: StructureType;
  bugs: { bugType: BugType }[];
}

export function getStructurePowerRequirement(
  structureType: StructureType,
): (typeof STRUCTURE_POWER_REQUIREMENTS)[StructureType] | undefined {
  return STRUCTURE_POWER_REQUIREMENTS[structureType];
}

export function structureRequiresPower(structureType: StructureType): boolean {
  return getStructurePowerRequirement(structureType) !== undefined;
}

export function getStructurePowerSuppliedCount(structure: StructureForPower): number {
  const requirement = getStructurePowerRequirement(structure.structureType);
  if (!requirement) {
    return 0;
  }

  return structure.bugs.filter(({ bugType }) => bugType === requirement.occupantBugType).length;
}

export function getStructurePowerMissing(structure: StructureForPower): number {
  const requirement = getStructurePowerRequirement(structure.structureType);
  if (!requirement) {
    return 0;
  }

  return Math.max(0, requirement.requiredCount - getStructurePowerSuppliedCount(structure));
}

export function getStructurePowerOccupantBugType(
  structureType: StructureType,
): BugType | undefined {
  return getStructurePowerRequirement(structureType)?.occupantBugType;
}

export function isStructurePowered(structure: StructureForPower): boolean {
  const requirement = getStructurePowerRequirement(structure.structureType);
  if (!requirement) {
    return true;
  }

  return getStructurePowerSuppliedCount(structure) >= requirement.requiredCount;
}

export function isStructureAwaitingPower(
  structure: StructureForBuild & StructureForPower,
): boolean {
  return (
    structureRequiresPower(structure.structureType) &&
    isStructureBuilt(structure) &&
    !isStructurePowered(structure)
  );
}

export function structureShowsActivationGlow(
  structure: StructureForBuild & StructureForPower,
): boolean {
  return isStructureIncomplete(structure) || isStructureAwaitingPower(structure);
}
