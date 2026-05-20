import { Item, Position, Stack } from "@happy-little-park/types";
import { isItem, isStack } from "../../utils/typeGuards";
import { addItemToStack } from "../stacks/add";
import { moveItem } from "../items/move";
import { createStack, updateStack } from "../../api/stacks";

export async function dropAction(
  targetPosition: Position,
  items: Item[],
  stacks: Stack[],
  itemOrStack: Item | Stack,
  targetItemOrStack?: Item | Stack,
): Promise<{ items: Item[]; stacks: Stack[] }> {
  const originalItem = isItem(itemOrStack) ? itemOrStack : undefined;
  const originalStack = isStack(itemOrStack) ? itemOrStack : undefined;

  const targetItem = targetItemOrStack
    ? isItem(targetItemOrStack)
      ? targetItemOrStack
      : undefined
    : undefined;
  const targetStack = targetItemOrStack
    ? isStack(targetItemOrStack)
      ? targetItemOrStack
      : undefined
    : undefined;

  // drop one item onto another to create a stack
  if (originalItem && targetItem) {
    const stack = await createStack({
      position: targetPosition,
      itemIds: [originalItem.id, targetItem.id],
    });

    return {
      items: items.filter((it) => it.id !== originalItem.id && it.id !== targetItem.id),
      stacks: [...stacks, stack],
    };
  }

  // drop an item onto a stack to add it to its items
  if (originalItem && targetStack) {
    await addItemToStack(originalItem.id, targetStack.id);

    return {
      items: items.filter((it) => it.id !== originalItem.id),
      stacks: stacks.map((s) =>
        s.id === targetStack.id ? { ...s, itemsCount: s.itemsCount + 1 } : s,
      ),
    };
  }

  // drop a stack onto an empty position
  if (originalStack) {
    const stack = await updateStack(originalStack.id, targetPosition);

    return {
      items: items,
      stacks: stacks.map((s) => (s.id === originalStack.id ? stack : s)),
    };
  }

  // drop an item onto an empty position
  if (originalItem) {
    const item = await moveItem(originalItem.id, targetPosition);

    return {
      items: items.map((it) => (it.id === originalItem.id ? item : it)),
      stacks: stacks,
    };
  }

  throw new Error("Invalid drop action");
}
