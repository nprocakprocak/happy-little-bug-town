import { canDropItemOnItem } from "@happy-little-bug-town/utils";

import { addItemToItem } from "../../../api/items";
import { Item } from "../../../types/item";
import { DropActionState } from "../../types/dropActionState";

export async function dropItemOnItemToCraft(
  originalItem: Item,
  targetItem: Item,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (!canDropItemOnItem(originalItem, targetItem)) {
    return undefined;
  }

  const parentItem = await addItemToItem(originalItem.id, targetItem.id);

  return {
    ...state,
    items: state.items
      .filter((it) => it.id !== originalItem.id)
      .map((it) => (it.id === targetItem.id ? parentItem : it)),
  };
}
