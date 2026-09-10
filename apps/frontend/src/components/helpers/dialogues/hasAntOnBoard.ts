import { GridEntity } from "../../../types/gridEntity";
import { isBug, isStack, isStructure } from "../typeGuards";

export function hasAntOnBoard(entities: GridEntity[]): boolean {
  return entities.some((entity) => {
    return isBug(entity) && entity.bugType === "ant";
  });
}
