import { canDropItemOnItem } from "@happy-little-bug-town/utils";

import { addItemToItem } from "../../../api/items";
import { Item } from "../../../types/item";
import { ApplyOptimisticDrop, DropActionState } from "../../types/dropActionState";

function optimisticDropItemOnItemToCraft(
  originalItem: Item,
  targetItem: Item,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    items: state.items
      .filter((it) => it.id !== originalItem.id)
      .map((it) =>
        it.id === targetItem.id
          ? {
              ...it,
              items: [...it.items, { id: originalItem.id, itemType: originalItem.itemType }],
            }
          : it,
      ),
  };
}

export async function dropItemOnItemToCraft(
  originalItem: Item,
  targetItem: Item,
  state: DropActionState,
  onOptimisticUpdate: ApplyOptimisticDrop,
): Promise<DropActionState | undefined> {
  if (!canDropItemOnItem(originalItem, targetItem)) {
    return undefined;
  }

  onOptimisticUpdate(optimisticDropItemOnItemToCraft(originalItem, targetItem, state));

  const parentItem = await addItemToItem(originalItem.id, targetItem.id);

  return {
    ...state,
    items: state.items
      .filter((it) => it.id !== originalItem.id)
      .map((it) => (it.id === targetItem.id ? parentItem : it)),
  };
}
