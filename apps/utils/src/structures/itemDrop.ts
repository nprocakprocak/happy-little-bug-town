import { ItemForCraft } from "../items/craft.js";
import { canAcceptItemForBuild, StructureForBuild } from "./build.js";
import { canStructureAcceptItemPowerDrop, StructureForPower } from "./power.js";
import { canAcceptOperationalResourceForStructure } from "./structureOperationalResources.js";

export function canDiscardItemOnStructure(
  structure: Pick<StructureForBuild, "structureType">,
): boolean {
  return (
    structure.structureType === "hole" || structure.structureType === "anthill"
  );
}

export function canDropItemOnStructure(
  item: ItemForCraft,
  structure: StructureForBuild & StructureForPower,
): boolean {
  if (canAcceptItemForBuild(structure, item.itemType)) {
    return true;
  }

  if (canStructureAcceptItemPowerDrop(item, structure)) {
    return true;
  }

  return canAcceptOperationalResourceForStructure(structure, item.itemType);
}
