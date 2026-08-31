import { canDiscardItemOnStructure, canDropFoodOnBug, canDropItemOnItem, canDropItemOnStructure, canStackItemType, canSwapOnGrid, isFoodForBug, Position, structureFootprintFits } from "@happy-little-bug-town/utils";
import { Item } from "../../../types/item";
import { GridEntity } from "../../../types/gridEntity";
import { isBug, isItem, isStack, isStructure } from "../typeGuards";

export function dropItem(
  itemToDrop: Item,
  overlappingEntity: GridEntity | undefined,
  dropPosition: Position,
  items: Item[],
  cols: number,
  rows: number,
  remainingEntities: GridEntity[]
): { 
  shouldCancel: boolean, 
  stackFootprintBlocked: boolean 
} {
  const overlappingItem = overlappingEntity && isItem(overlappingEntity) ? overlappingEntity : undefined;
  const overlappingStack = overlappingEntity && isStack(overlappingEntity) ? overlappingEntity : undefined;
  const overlappingBug = overlappingEntity && isBug(overlappingEntity) ? overlappingEntity : undefined;
  const overlappingStructure = overlappingEntity && isStructure(overlappingEntity) ? overlappingEntity : undefined;

  const canDropOnItemCraft =
    !!overlappingItem && canDropItemOnItem(itemToDrop, overlappingItem);
  const wouldCreateOrJoinStack =
    (!!overlappingItem && !canDropOnItemCraft) || !!overlappingStack;
  const sameTypeItems = overlappingItem?.itemType === itemToDrop.itemType;
  const sameTypeAsStack = overlappingStack?.itemType === itemToDrop.itemType;
  const typeAllowed = sameTypeItems || sameTypeAsStack;
  const stackNotAllowed =
    wouldCreateOrJoinStack &&
    (!canStackItemType(itemToDrop.itemType, items) || !typeAllowed);
  const foodForOverlappingBug =
    !!overlappingBug && isFoodForBug(itemToDrop.itemType, overlappingBug);
  const canDropFoodOnOverlappingBug =
    foodForOverlappingBug && canDropFoodOnBug(itemToDrop.itemType, overlappingBug);
  const canDropOnStructure =
    !!overlappingStructure &&
    (canDropItemOnStructure(itemToDrop, overlappingStructure) ||
      canDiscardItemOnStructure(overlappingStructure));
  const wouldCreateStack =
    !!overlappingItem &&
    !canDropOnItemCraft &&
    sameTypeItems &&
    canStackItemType(itemToDrop.itemType, items);
  const stackFootprintBlocked =
    wouldCreateStack &&
    overlappingItem !== undefined &&
    !structureFootprintFits({ x: dropPosition.x, y: dropPosition.y, itemsCount: 2 }, cols, rows, remainingEntities);
  const canSwapWithTarget = !!overlappingEntity && canSwapOnGrid(itemToDrop, overlappingEntity);
  const emptyCellBlocked =
    !overlappingEntity &&
    !structureFootprintFits(
      { x: dropPosition.x, y: dropPosition.y, itemType: itemToDrop.itemType },
      cols,
      rows,
      remainingEntities
    );
  const hasDedicatedAction =
    canDropOnItemCraft ||
    canDropFoodOnOverlappingBug ||
    canDropOnStructure ||
    (wouldCreateOrJoinStack && !stackNotAllowed);
  const shouldCancel =
    stackFootprintBlocked ||
    emptyCellBlocked ||
    (foodForOverlappingBug && !canDropFoodOnOverlappingBug) ||
    (!!overlappingEntity && !hasDedicatedAction && !canSwapWithTarget);

  return {
    shouldCancel,
    stackFootprintBlocked,
  }
}
