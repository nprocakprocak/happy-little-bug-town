import { canStackItemType } from "@happy-little-bug-town/utils";

import { addItemToStack } from "../../../api/items";
import { Item } from "../../../types/item";
import { Stack } from "../../../types/stack";
import { ApplyOptimisticDrop, DropActionState } from "../../types/dropActionState";

function optimisticDropItemOnStack(
  originalItem: Item,
  targetStack: Stack,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
    stacks: state.stacks.map((s) =>
      s.id === targetStack.id ? { ...s, itemsCount: s.itemsCount + 1 } : s,
    ),
  };
}

export async function dropItemOnStack(
  originalItem: Item,
  targetStack: Stack,
  state: DropActionState,
  onOptimisticUpdate: ApplyOptimisticDrop,
): Promise<DropActionState | undefined> {
  if (originalItem.itemType !== targetStack.itemType) {
    return undefined;
  }

  if (!canStackItemType(originalItem.itemType, state.items)) {
    return undefined;
  }

  onOptimisticUpdate(optimisticDropItemOnStack(originalItem, targetStack, state));

  const stack = await addItemToStack(originalItem.id, targetStack.id);

  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
    stacks: state.stacks.map((s) => (s.id === targetStack.id ? stack : s)),
  };
}
