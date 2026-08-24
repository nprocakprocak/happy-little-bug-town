import { ItemForCraft } from "../items/craft.js";
import { canAcceptItemForBuild, StructureForBuild } from "./build.js";
import { isGroundEvolutionStructureType } from "./evolution.js";
import { canStructureAcceptItemPowerDrop, StructureForPower } from "./power.js";
import { canAcceptOperationalResourceForStructure } from "./structureOperationalResources.js";
import { canAcceptItemForUpgrade, StructureForUpgrade } from "./upgrade.js";

export function canDiscardItemOnStructure(
  structure: Pick<StructureForBuild, "structureType">,
): boolean {
  return isGroundEvolutionStructureType(structure.structureType);
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
