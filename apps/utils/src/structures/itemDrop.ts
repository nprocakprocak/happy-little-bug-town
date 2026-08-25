import { ItemForCraft } from "../items/craft.js";
import { BugType } from "../types/bugType.js";
import { canAcceptItemForBuild, StructureForBuild } from "./build.js";
import { isGroundEvolutionStructureType } from "./evolution.js";
import { canStructureAcceptGreenflyDrop } from "./greenflyHouse.js";
import {
  canStructureAcceptBugDrop,
  canStructureAcceptItemPowerDrop,
  StructureForPower,
} from "./power.js";
import { canAcceptOperationalResourceForStructure } from "./structureOperationalResources.js";
import { canAcceptItemForUpgrade, StructureForUpgrade } from "./upgrade.js";

export function canDiscardItemOnStructure(
  structure: Pick<StructureForBuild, "structureType">,
): boolean {
  return isGroundEvolutionStructureType(structure.structureType);
}

export function canDiscardBugOnStructure(
  bug: { bugType: BugType },
  structure: StructureForBuild & StructureForPower,
): boolean {
  return canDiscardItemOnStructure(structure) && !canStructureAcceptBugDrop(bug, structure);
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

  if (canStructureAcceptGreenflyDrop(item, structure)) {
    return true;
  }

  return canAcceptOperationalResourceForStructure(structure, item.itemType);
}
