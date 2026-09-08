import { GridEntity } from "../../types/gridEntity";
import { isBug, isItem, isStack } from "./typeGuards";

export function hasLeafAndBeetleOnBoard(entities: GridEntity[]): boolean {
  const hasLeaf = entities.some(
    (entity) => (isItem(entity) || isStack(entity)) && entity.itemType === "leaf_part",
  );
  const hasBeetle = entities.some((entity) => isBug(entity) && entity.bugType === "beetle");
  return hasLeaf && hasBeetle;
}
