import { Position, Positionable } from "@happy-little-park/utils";

import { addBeetleToStructure, updateBugPosition } from "../../api/bugs";
import {
  addItemToBug,
  addItemToStack,
  addItemToStructure,
  updateItemPosition,
} from "../../api/items";
import { createStack, mergeStacks, updateStack } from "../../api/stacks";
import { updateStructurePosition } from "../../api/structures";
import { BEETLE_MAX_LEAF_PARTS } from "../../constants";
import { canDropBeetleOnStructure, canDropItemOnStructure } from "../../constants/beetleBuild";
import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { isBug, isItem, isStack, isStructure } from "../../utils/typeGuards";

export async function dropAction(
  targetPosition: Position,
  items: Item[],
  stacks: Stack[],
  bugs: Bug[],
  structures: Structure[],
  entity: Positionable,
  targetEntity?: Positionable,
): Promise<{ items: Item[]; stacks: Stack[]; bugs: Bug[]; structures: Structure[] }> {
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

  // drop one item onto another to create a stack
  if (originalItem && targetItem) {
    if (!originalItem.stackable || !targetItem.stackable) {
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
    if (!originalItem.stackable) {
      throw new Error("Item cannot be added to stack");
    }
    await addItemToStack(originalItem.id, targetStack.id);

    return {
      items: items.filter((it) => it.id !== originalItem.id),
      stacks: stacks.map((s) =>
        s.id === targetStack.id ? { ...s, itemsCount: s.itemsCount + 1 } : s,
      ),
      bugs: bugs,
      structures: structures,
    };
  }

  if (originalItem && targetBug) {
    if (originalItem.itemType !== "leaf_part" || targetBug.bugType !== "beetle") {
      throw new Error("Item cannot be given to bug");
    }
    if (targetBug.itemIds.length >= BEETLE_MAX_LEAF_PARTS) {
      throw new Error("Beetle is already full");
    }
    const bug = await addItemToBug(originalItem.id, targetBug.id);

    return {
      items: items.filter((it) => it.id !== originalItem.id),
      stacks: stacks,
      bugs: bugs.map((b) => (b.id === targetBug.id ? bug : b)),
      structures: structures,
    };
  }

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

  if (originalBug && targetStructure) {
    if (!canDropBeetleOnStructure(originalBug, targetStructure)) {
      throw new Error("Beetle cannot be added to structure");
    }
    const structure = await addBeetleToStructure(originalBug.id, targetStructure.id);

    return {
      items: items,
      stacks: stacks,
      bugs: bugs.filter((b) => b.id !== originalBug.id),
      structures: structures.map((s) => (s.id === targetStructure.id ? structure : s)),
    };
  }

  // drop a stack onto another stack of the same type to merge
  if (originalStack && targetStack) {
    const mergedStack = await mergeStacks(originalStack.id, targetStack.id);

    return {
      items: items,
      stacks: stacks
        .filter((s) => s.id !== originalStack.id)
        .map((s) => (s.id === targetStack.id ? mergedStack : s)),
      bugs: bugs,
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
    const structure = await updateStructurePosition(originalStructure.id, targetPosition);

    return {
      items: items,
      stacks: stacks,
      bugs: bugs,
      structures: structures.map((s) => (s.id === originalStructure.id ? structure : s)),
    };
  }

  throw new Error("Invalid drop action");
}
