import { canDiscardItemOnStructure } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { deleteItem } from "../../../api/items";
import { Item } from "../../../types/item";
import { Structure } from "../../../types/structure";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

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
  queryClient: QueryClient,
): Promise<DropActionState | undefined> {
  if (!canDiscardItemOnStructure(targetStructure)) {
    return undefined;
  }

  applyDropActionState(queryClient, optimisticDropItemToDiscard(originalItem, state));

  await deleteItem(originalItem.id, targetStructure.id);

  return optimisticDropItemToDiscard(originalItem, state);
}
