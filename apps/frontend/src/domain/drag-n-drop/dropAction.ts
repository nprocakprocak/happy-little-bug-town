import { Position, Positionable } from "@happy-little-park/utils";

import { updateBugPosition } from "../../api/bugs";
import { addItemToStack, updateItemPosition } from "../../api/items";
import { createStack, mergeStacks, updateStack } from "../../api/stacks";
import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { isBug, isItem, isStack, isStructure } from "../../utils/typeGuards";
import { Structure } from "../../types/structure";
import { updateStructurePosition } from "../../api/structures";

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
