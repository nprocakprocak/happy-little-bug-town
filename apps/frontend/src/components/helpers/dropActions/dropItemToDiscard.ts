import { canDiscardItemOnStructure } from "@happy-little-bug-town/utils";

import { deleteItem } from "../../../api/items";
import { Item } from "../../../types/item";
import { Structure } from "../../../types/structure";
import { DropActionState } from "../../types/dropActionState";

export async function dropItemToDiscard(
  originalItem: Item,
  targetStructure: Structure,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (!canDiscardItemOnStructure(targetStructure)) {
    return undefined;
  }

  await deleteItem(originalItem.id, targetStructure.id);

  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
  };
}
