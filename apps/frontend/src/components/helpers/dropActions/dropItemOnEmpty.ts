import { Position } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { updateItemPosition } from "../../../api/items";
import { Item } from "../../../types/item";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

function optimisticDropItemOnEmpty(
  originalItem: Item,
  targetPosition: Position,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    items: state.items.map((it) =>
      it.id === originalItem.id ? { ...it, x: targetPosition.x, y: targetPosition.y } : it,
    ),
  };
}

export async function dropItemOnEmpty(
  originalItem: Item,
  targetPosition: Position,
  state: DropActionState,
  queryClient: QueryClient,
): Promise<DropActionState> {
  applyDropActionState(queryClient, optimisticDropItemOnEmpty(originalItem, targetPosition, state));

  const item = await updateItemPosition(originalItem.id, targetPosition);

  return {
    ...state,
    items: state.items.map((it) => (it.id === originalItem.id ? item : it)),
  };
}
