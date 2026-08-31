import { canStackItemType, Position, structureFootprintFits } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";
import { Item } from "../../../types/item";
import { Stack } from "../../../types/stack";
import { isStack } from "../typeGuards";

export function dropStack(
  stackToDrop: Stack,
  overlappingEntity: GridEntity | undefined,
  dropPosition: Position,
  items: Item[],
  cols: number,
  rows: number,
  remainingEntities: GridEntity[],
): {
  shouldCancel: boolean;
} {
  const overlappingStack =
    overlappingEntity && isStack(overlappingEntity) ? overlappingEntity : undefined;

  const isMerge =
    !!overlappingStack &&
    overlappingStack.itemType === stackToDrop.itemType &&
    canStackItemType(stackToDrop.itemType, items);
  const blockedByOtherEntity =
    (!!overlappingEntity && !overlappingStack) || (!!overlappingStack && !isMerge);

  if (blockedByOtherEntity) {
    return { shouldCancel: true };
  }

  if (isMerge) {
    return { shouldCancel: false };
  }

  const fits = structureFootprintFits(
    { x: dropPosition.x, y: dropPosition.y, itemsCount: stackToDrop.itemsCount },
    cols,
    rows,
    remainingEntities,
  );

  return { shouldCancel: !fits };
}
