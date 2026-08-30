import { canDiscardItemOnStructure } from "@happy-little-bug-town/utils";

import { deleteItem } from "../../../api/items";
import { Item } from "../../../types/item";
import { Structure } from "../../../types/structure";
import { ApplyOptimisticDrop, DropActionState } from "../../types/dropActionState";

function optimisticDropItemToDiscard(originalItem: Item, state: DropActionState): DropActionState {
  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
  };
}

export async function dropItemToDiscard(
  originalItem: Item,
  targetStructure: Structure,
  state: DropActionState,
  onOptimisticUpdate: ApplyOptimisticDrop,
): Promise<DropActionState | undefined> {
  if (!canDiscardItemOnStructure(targetStructure)) {
    return undefined;
  }

  onOptimisticUpdate(optimisticDropItemToDiscard(originalItem, state));

  await deleteItem(originalItem.id, targetStructure.id);

  return optimisticDropItemToDiscard(originalItem, state);
}
