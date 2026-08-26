import { getBugFoodRequirement } from "../bugs/feeding.js";
import { ItemForCraft } from "../items/craft.js";
import { BugType } from "../types/bugType.js";
import { canAcceptItemForBuild, StructureForBuild } from "./build.js";
import { isGroundEvolutionStructureType } from "./evolution.js";
import {
  canStructureAcceptBugDrop,
  canStructureAcceptItemPowerDrop,
  structureDropRequiresFedBug,
  StructureForPower,
} from "./power.js";
import {
  canAcceptOperationalBugForStructure,
  canAcceptOperationalResourceForStructure,
} from "./structureOperationalResources.js";
import { canAcceptItemForUpgrade, StructureForUpgrade } from "./upgrade.js";

export function canDiscardItemOnStructure(
  structure: Pick<StructureForBuild, "structureType">,
): boolean {
  return isGroundEvolutionStructureType(structure.structureType);
}

export function canStructureAcceptDroppedBug(
  bug: { bugType: BugType },
  structure: StructureForBuild & StructureForPower & StructureForUpgrade,
): boolean {
  return (
    canStructureAcceptBugDrop(bug, structure) ||
    canAcceptOperationalBugForStructure(structure, bug.bugType)
  );
}

export function droppedBugMustBeFed(
  bug: { bugType: BugType },
  structure: StructureForBuild & StructureForPower & StructureForUpgrade,
): boolean {
  if (
    canStructureAcceptBugDrop(bug, structure) &&
    structureDropRequiresFedBug(structure.structureType, structure.upgradeLevel)
  ) {
    return true;
  }

  return (
    canAcceptOperationalBugForStructure(structure, bug.bugType) &&
    getBugFoodRequirement(bug.bugType) !== undefined
  );
}

export function canDiscardBugOnStructure(
  bug: { bugType: BugType },
  structure: StructureForBuild & StructureForPower & StructureForUpgrade,
): boolean {
  return (
    canDiscardItemOnStructure(structure) &&
    !canStructureAcceptDroppedBug(bug, structure)
  );
}

export function canDropItemOnStructure(
  item: ItemForCraft,
  structure: StructureForBuild & StructureForPower & StructureForUpgrade,
): boolean {
  if (canAcceptItemForBuild(structure, item.itemType)) {
    return true;
  }

  if (canAcceptItemForUpgrade(structure, item.itemType)) {
    return true;
  }

  if (canStructureAcceptItemPowerDrop(item, structure)) {
    return true;
  }

  return canAcceptOperationalResourceForStructure(structure, item.itemType);
}
