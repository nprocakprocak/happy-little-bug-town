import {
  canDiscardBugOnStructure,
  canDiscardItemOnStructure,
  canDropBugOnStack,
  canDropFoodOnBug,
  canDropItemOnItem,
  canDropItemOnStructure,
  canStackItemType,
  canStructureAcceptDroppedBug,
  droppedBugMustBeFed,
  isBugFed,
  Position,
  Positionable,
} from "@happy-little-bug-town/utils";

import { addBeetleToStructure, addBugToStack, deleteBug, updateBugPosition } from "../api/bugs";
import {
  addItemToBug,
  addItemToItem,
  addItemToStack,
  addItemToStructure,
  deleteItem,
  updateItemPosition,
} from "../api/items";
import { createStack, mergeStacks, updateStack } from "../api/stacks";
import { updateStructure } from "../api/structures";
import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { isBug, isItem, isStack, isStructure } from "./typeGuards";

export async function dropAction(
  targetPosition: Position,
  items: Item[],
  stacks: Stack[],
  bugs: Bug[],
  structures: Structure[],
  entity: Positionable,
  targetEntity?: Positionable,
): Promise<{
  items: Item[];
  stacks: Stack[];
  bugs: Bug[];
  structures: Structure[];
}> {
  const originalItem = isItem(entity) ? entity : undefined;
  const originalStack = isStack(entity) ? entity : undefined;
  const originalBug = isBug(entity) ? entity : undefined;
  const originalStructure = isStructure(entity) ? entity : undefined;

  const targetItem = targetEntity ? (isItem(targetEntity) ? targetEntity : undefined) : undefined;
  const targetStack = targetEntity ? (isStack(targetEntity) ? targetEntity : undefined) : undefined;
  const targetBug = targetEntity ? (isBug(targetEntity) ? targetEntity : undefined) : undefined;
  const targetStructure = targetEntity
    ? isStructure(targetEntity)
      ? targetEntity
      : undefined
    : undefined;

  // drop an item onto another item to craft it
  if (originalItem && targetItem && canDropItemOnItem(originalItem, targetItem)) {
    const parentItem = await addItemToItem(originalItem.id, targetItem.id);

    return {
      items: items
        .filter((it) => it.id !== originalItem.id)
        .map((it) => (it.id === targetItem.id ? parentItem : it)),
      stacks: stacks,
      bugs: bugs,
      structures: structures,
    };
  }

  // drop one item onto another to create a stack
  if (originalItem && targetItem) {
    if (!canStackItemType(originalItem.itemType, items)) {
      throw new Error("Items cannot be stacked");
    }
    const stack = await createStack({
      position: targetPosition,
      itemIds: [originalItem.id, targetItem.id],
    });

    return {
      items: items.filter((it) => it.id !== originalItem.id && it.id !== targetItem.id),
      stacks: [...stacks, stack],
      bugs: bugs,
      structures: structures,
    };
  }

  // drop an item onto a stack to add it to its items
  if (originalItem && targetStack) {
    if (!canStackItemType(originalItem.itemType, items)) {
      throw new Error("Item cannot be added to stack");
    }
    const stack = await addItemToStack(originalItem.id, targetStack.id);

    return {
      items: items.filter((it) => it.id !== originalItem.id),
      stacks: stacks.map((s) => (s.id === targetStack.id ? stack : s)),
      bugs: bugs,
      structures: structures,
    };
  }

  // drop food onto a bug to feed it
  if (originalItem && targetBug) {
    if (!canDropFoodOnBug(originalItem.itemType, targetBug)) {
      throw new Error("Item cannot be given to bug");
    }
    const bug = await addItemToBug(originalItem.id, targetBug.id);

    return {
      items: items.filter((it) => it.id !== originalItem.id),
      stacks: stacks,
      bugs: bugs.map((b) => (b.id === targetBug.id ? bug : b)),
      structures: structures,
    };
  }

  // drop an item to discard it
  if (originalItem && targetStructure && canDiscardItemOnStructure(targetStructure)) {
    await deleteItem(originalItem.id, targetStructure.id);

    return {
      items: items.filter((it) => it.id !== originalItem.id),
      stacks: stacks,
      bugs: bugs,
      structures: structures,
    };
  }

  // drop an item onto a structure to add it to its items
  if (originalItem && targetStructure) {
    if (!canDropItemOnStructure(originalItem, targetStructure)) {
      throw new Error("Item cannot be added to structure");
    }
    const structure = await addItemToStructure(originalItem.id, targetStructure.id);

    return {
      items: items.filter((it) => it.id !== originalItem.id),
      stacks: stacks,
      bugs: bugs,
      structures: structures.map((s) => (s.id === targetStructure.id ? structure : s)),
    };
  }

  // drop a bug to discard it
  if (originalBug && targetStructure && canDiscardBugOnStructure(originalBug, targetStructure)) {
    await deleteBug(originalBug.id, targetStructure.id);

    return {
      items: items,
      stacks: stacks,
      bugs: bugs.filter((b) => b.id !== originalBug.id),
      structures: structures,
    };
  }

  // drop a bug onto a structure to add it to its habitat
  if (originalBug && targetStructure) {
    if (!canStructureAcceptDroppedBug(originalBug, targetStructure)) {
      throw new Error("Bug cannot be added to structure");
    }
    if (droppedBugMustBeFed(originalBug, targetStructure) && !isBugFed(originalBug)) {
      throw new Error("Bug must be fed before joining structure");
    }
    const structure = await addBeetleToStructure(originalBug.id, targetStructure.id);

    return {
      items: items,
      stacks: stacks,
      bugs: bugs.filter((b) => b.id !== originalBug.id),
      structures: structures.map((s) => (s.id === targetStructure.id ? structure : s)),
    };
  }

  // drop a bug onto a stack to assign it
  if (originalBug && targetStack) {
    if (!canDropBugOnStack(originalBug, targetStack)) {
      throw new Error("Bug cannot be added to stack");
    }
    if (!isBugFed(originalBug)) {
      throw new Error("Bug must be fed before joining stack");
    }
    const stack = await addBugToStack(originalBug.id, targetStack.id);

    return {
      items: items,
      stacks: stacks.map((s) => (s.id === targetStack.id ? stack : s)),
      bugs: bugs.filter((b) => b.id !== originalBug.id),
      structures: structures,
    };
  }

  // drop a stack onto another stack of the same type to merge
  if (originalStack && targetStack) {
    if (!canStackItemType(originalStack.itemType, items)) {
      throw new Error("Stacks cannot be merged");
    }
    const { stack: mergedStack, releasedBugs } = await mergeStacks(
      originalStack.id,
      targetStack.id,
    );

    return {
      items: items,
      stacks: stacks
        .filter((s) => s.id !== originalStack.id)
        .map((s) => (s.id === targetStack.id ? mergedStack : s)),
      bugs: [
        ...bugs,
        ...releasedBugs.map((bug) => ({
          ...bug,
          fromX: targetStack.x,
          fromY: targetStack.y,
        })),
      ],
      structures: structures,
    };
  }

  // drop an entity onto an empty position

  if (originalStack) {
    const stack = await updateStack(originalStack.id, targetPosition);

    return {
      items: items,
      stacks: stacks.map((s) => (s.id === originalStack.id ? stack : s)),
      bugs: bugs,
      structures: structures,
    };
  }

  if (originalItem) {
    const item = await updateItemPosition(originalItem.id, targetPosition);

    return {
      items: items.map((it) => (it.id === originalItem.id ? item : it)),
      stacks: stacks,
      bugs: bugs,
      structures: structures,
    };
  }

  if (originalBug) {
    const bug = await updateBugPosition(originalBug.id, targetPosition);

    return {
      items: items,
      stacks: stacks,
      bugs: bugs.map((b) => (b.id === originalBug.id ? bug : b)),
      structures: structures,
    };
  }

  if (originalStructure) {
    const structure = await updateStructure(originalStructure.id, targetPosition);

    return {
      items: items,
      stacks: stacks,
      bugs: bugs,
      structures: structures.map((s) => (s.id === originalStructure.id ? structure : s)),
    };
  }

  throw new Error("Invalid drop action");
}
