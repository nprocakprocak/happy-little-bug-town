import { BEETLE_MAX_LEAF_PARTS } from "../constants/game.js";
import {
  STRUCTURE_POWER_REQUIREMENTS,
  StructureToolPowerRequirement,
} from "../constants/structurePowerRequirements.js";
import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";
import { ToolType } from "../types/toolType.js";
import { isToolCrafted, ToolForCraft } from "../tools/craft.js";
import { isStructureBuilt, isStructureIncomplete, StructureForBuild } from "./build.js";

export interface StructureForPower {
  structureType: StructureType;
  bugs: { bugType: BugType }[];
  tools?: { toolType: ToolType }[];
}

export interface BugForFedCheck {
  itemIds: string[];
}

export interface BugForStructureDrop {
  bugType: BugType;
  itemIds: string[];
}

export function isBugFed(bug: BugForFedCheck): boolean {
  return bug.itemIds.length >= BEETLE_MAX_LEAF_PARTS;
}

export function structureDropRequiresFedBug(structureType: StructureType): boolean {
  return structureRequiresPower(structureType);
}

export function canStructureAcceptBugDrop(
  bug: Pick<BugForStructureDrop, "bugType">,
  structure: StructureForBuild & StructureForPower,
): boolean {
  if (structure.structureType === "beetle_house") {
    return isStructureBuilt(structure) && bug.bugType === "beetle";
  }

  const requirement = getStructurePowerRequirement(structure.structureType);
  if (!requirement) {
    return false;
  }

  return (
    isStructureBuilt(structure) &&
    bug.bugType === requirement.occupantBugType &&
    getStructurePowerSuppliedCount(structure) < requirement.requiredCount
  );
}

export function canDropBugOnStructure(
  bug: BugForStructureDrop,
  structure: StructureForBuild & StructureForPower,
): boolean {
  if (!canStructureAcceptBugDrop(bug, structure)) {
    return false;
  }

  if (structureDropRequiresFedBug(structure.structureType)) {
    return isBugFed(bug);
  }

  return true;
}

export function getStructurePowerRequirement(
  structureType: StructureType,
): (typeof STRUCTURE_POWER_REQUIREMENTS)[StructureType] | undefined {
  return STRUCTURE_POWER_REQUIREMENTS[structureType];
}

export function getStructureToolPowerRequirements(
  structureType: StructureType,
): StructureToolPowerRequirement[] {
  return getStructurePowerRequirement(structureType)?.toolRequirements ?? [];
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

export function getStructureToolPowerSuppliedCount(
  structure: StructureForPower,
  toolType: ToolType,
): number {
  return (structure.tools ?? []).filter((tool) => tool.toolType === toolType).length;
}

export function getStructurePowerMissing(structure: StructureForPower): number {
  const requirement = getStructurePowerRequirement(structure.structureType);
  if (!requirement) {
    return 0;
  }

  return Math.max(0, requirement.requiredCount - getStructurePowerSuppliedCount(structure));
}

export function getStructureToolPowerMissing(
  structure: StructureForPower,
  toolType: ToolType,
): number {
  const toolRequirement = getStructureToolPowerRequirements(structure.structureType).find(
    (requirement) => requirement.toolType === toolType,
  );
  if (!toolRequirement) {
    return 0;
  }

  return Math.max(
    0,
    toolRequirement.requiredCount - getStructureToolPowerSuppliedCount(structure, toolType),
  );
}

export function getStructurePowerOccupantBugType(
  structureType: StructureType,
): BugType | undefined {
  return getStructurePowerRequirement(structureType)?.occupantBugType;
}

export function hasStructureToolPowerRequirements(structureType: StructureType): boolean {
  return getStructureToolPowerRequirements(structureType).length > 0;
}

export function isStructureBugPowered(structure: StructureForPower): boolean {
  const requirement = getStructurePowerRequirement(structure.structureType);
  if (!requirement) {
    return true;
  }

  return getStructurePowerSuppliedCount(structure) >= requirement.requiredCount;
}

export function isStructureToolPowered(structure: StructureForPower): boolean {
  const toolRequirements = getStructureToolPowerRequirements(structure.structureType);
  if (toolRequirements.length === 0) {
    return true;
  }

  return toolRequirements.every(
    ({ toolType, requiredCount }) =>
      getStructureToolPowerSuppliedCount(structure, toolType) >= requiredCount,
  );
}

export function isStructurePowered(structure: StructureForPower): boolean {
  return isStructureBugPowered(structure) && isStructureToolPowered(structure);
}

export function canStructureAcceptToolDrop(
  tool: ToolForCraft,
  structure: StructureForBuild & StructureForPower,
): boolean {
  const toolRequirement = getStructureToolPowerRequirements(structure.structureType).find(
    (requirement) => requirement.toolType === tool.toolType,
  );
  if (!toolRequirement) {
    return false;
  }

  return (
    isStructureBuilt(structure) &&
    isToolCrafted(tool) &&
    getStructureToolPowerSuppliedCount(structure, tool.toolType) < toolRequirement.requiredCount
  );
}

export function canDropToolOnStructure(
  tool: ToolForCraft,
  structure: StructureForBuild & StructureForPower,
): boolean {
  return canStructureAcceptToolDrop(tool, structure);
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
