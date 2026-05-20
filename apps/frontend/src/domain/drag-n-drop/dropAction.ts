import { Item, Position, Stack } from "@happy-little-park/types";
import { isItem, isStack } from "../../utils/typeGuards";

export async function dropAction(
  targetPosition: Position, 
  items: Item[],
  stacks: Stack[],
  itemOrStack: Item | Stack, 
  targetItemOrStack?: Item | Stack,
): Promise<{ items: Item[], stacks: Stack[] }> {
  const originalItem = isItem(itemOrStack) ? itemOrStack : undefined;
  const originalStack = isStack(itemOrStack) ? itemOrStack : undefined;
  
  const targetItem = targetItemOrStack ? (isItem(targetItemOrStack) ? targetItemOrStack : undefined) : undefined;
  const targetStack = targetItemOrStack ? (isStack(targetItemOrStack) ? targetItemOrStack : undefined) : undefined;

  // drop one item onto another to create a stack
  if (originalItem && targetItem) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks/create`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        x: targetPosition.x,
        y: targetPosition.y,
        itemType: targetItem.itemType,
        itemIds: [originalItem.id, targetItem.id],
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error("Failed to create stack" + error);
    }

    const stack = await response.json();

    return {
      items: items.filter((it) => it.id !== originalItem.id && it.id !== targetItem.id),
      stacks: [...stacks, stack],
    }
  }

  // drop an item onto a stack to add it to its items
  if (originalItem && targetStack) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/${originalItem.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stackId: targetStack.id }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error("Failed to update item" + error);
    }

    return {
      items: items.filter((it) => it.id !== originalItem.id),
      stacks: stacks.map((s) => (s.id === targetStack.id ? { ...s, itemsCount: s.itemsCount + 1 } : s)),
    }
  }

  // drop a stack onto an empty position
  if (originalStack) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks/${originalStack.id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetPosition),
      },
    );

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error("Failed to update stack" + error);
    }

    const stack = await response.json();

    return {
      items: items,
      stacks: stacks.map((s) => (s.id === originalStack.id ? stack : s)),
    }
  }

  // drop an item onto an empty position
  if (originalItem) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/${originalItem.id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetPosition),
      },
    );

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error("Failed to update item" + error);
    }

    const item = await response.json();

    return {
      items: items.map((it) => (it.id === originalItem.id ? item : it)),
      stacks: stacks,
    }
  }

  throw new Error("Invalid drop action");
}