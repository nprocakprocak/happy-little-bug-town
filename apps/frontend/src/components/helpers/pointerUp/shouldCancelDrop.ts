import { Position } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../../types/gridEntity";
import { Item } from "../../../types/item";
import { isBug, isItem, isStack, isStructure } from "../typeGuards";
import { shouldCancelBugDrop } from "./shouldCancelBugDrop";
import { shouldCancelItemDrop } from "./shouldCancelItemDrop";
import { shouldCancelStackDrop } from "./shouldCancelStackDrop";
import { shouldCancelStructureDrop } from "./shouldCancelStructureDrop";

interface ShouldCancelDropProps {
  entityToDrop: GridEntity;
  targetEntity: GridEntity | undefined;
  dropPosition: Position;
  cols: number;
  rows: number;
  entities: GridEntity[];
  items: Item[];
}

export function shouldCancelDrop({
  entityToDrop,
  targetEntity,
  dropPosition,
  cols,
  rows,
  entities,
  items,
}: ShouldCancelDropProps): "cancel" | "hungryBug" | "stackCreateBlocked" | null {
  const remaining = entities.filter((entity) => entity.id !== entityToDrop.id);

  if (isItem(entityToDrop)) {
    return shouldCancelItemDrop(
      entityToDrop,
      targetEntity,
      dropPosition,
      items,
      cols,
      rows,
      remaining,
    );
  }

  if (isStack(entityToDrop)) {
    return shouldCancelStackDrop(
      entityToDrop,
      targetEntity,
      dropPosition,
      items,
      cols,
      rows,
      remaining,
    );
  }

  if (isStructure(entityToDrop)) {
    return shouldCancelStructureDrop(entityToDrop, dropPosition, items, cols, rows, remaining);
  }

  if (isBug(entityToDrop)) {
    return shouldCancelBugDrop(entityToDrop, targetEntity);
  }

  return null;
}
