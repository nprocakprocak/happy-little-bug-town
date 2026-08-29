import { Position } from "@happy-little-bug-town/utils";

import { updateItemPosition } from "../../../api/items";
import { Item } from "../../../types/item";
import { DropActionState } from "../../types/dropActionState";

export async function dropItemOnEmpty(
  originalItem: Item,
  targetPosition: Position,
  state: DropActionState,
): Promise<DropActionState> {
  const item = await updateItemPosition(originalItem.id, targetPosition);

  return {
    ...state,
    items: state.items.map((it) => (it.id === originalItem.id ? item : it)),
  };
}
