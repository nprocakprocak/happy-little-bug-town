import { canStackItemType } from "@happy-little-bug-town/utils";

import { addItemToStack } from "../../../api/items";
import { Item } from "../../../types/item";
import { Stack } from "../../../types/stack";
import { DropActionState } from "../../types/dropActionState";

export async function dropItemOnStack(
  originalItem: Item,
  targetStack: Stack,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (originalItem.itemType !== targetStack.itemType) {
    return undefined;
  }

  if (!canStackItemType(originalItem.itemType, state.items)) {
    return undefined;
  }

  const stack = await addItemToStack(originalItem.id, targetStack.id);

  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
    stacks: state.stacks.map((s) => (s.id === targetStack.id ? stack : s)),
  };
}
