import { ItemType } from "../types/itemType.js";
import { StructureType } from "../types/structureType.js";
import { isStructureBuilt, StructureForBuild } from "./build.js";

export function getGreenflyHouseOccupants<T extends { itemType: ItemType }>(
  structure: { structureType: StructureType; items: T[] },
): T[] {
  if (structure.structureType !== "greenfly_house") {
    return [];
  }

  return structure.items.filter((item) => item.itemType === "greenfly");
}

export function canStructureAcceptGreenflyDrop(
  item: { itemType: ItemType },
  structure: StructureForBuild,
): boolean {
  return (
    structure.structureType === "greenfly_house" &&
    isStructureBuilt(structure) &&
    item.itemType === "greenfly"
  );
}
