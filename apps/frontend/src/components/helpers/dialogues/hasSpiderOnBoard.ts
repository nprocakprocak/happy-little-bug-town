import { GridEntity } from "../../../types/gridEntity";
import { isBug } from "../typeGuards";

export function hasSpiderOnBoard(entities: GridEntity[]): boolean {
  return entities.some((entity) => isBug(entity) && entity.bugType === "spider");
}
