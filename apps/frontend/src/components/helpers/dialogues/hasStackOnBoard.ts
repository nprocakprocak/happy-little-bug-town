import { GridEntity } from "../../../types/gridEntity";
import { isStack } from "../typeGuards";

export function hasStackOnBoard(entities: GridEntity[]): boolean {
  return entities.some((entity) => isStack(entity));
}
