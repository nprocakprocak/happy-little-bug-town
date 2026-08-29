import { canStackItemType, Position } from "@happy-little-bug-town/utils";

import { createStack } from "../../../api/stacks";
import { Item } from "../../../types/item";
import { DropActionState } from "../../types/dropActionState";

export async function dropItemOnItemToStack(
  originalItem: Item,
  targetItem: Item,
  targetPosition: Position,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (originalItem.itemType !== targetItem.itemType) {
    return undefined;
  }

  if (!canStackItemType(originalItem.itemType, state.items)) {
    return undefined;
  }

  const stack = await createStack({
    position: targetPosition,
    itemIds: [originalItem.id, targetItem.id],
  });

  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id && it.id !== targetItem.id),
    stacks: [...state.stacks, stack],
  };
}
