import { canDropFoodOnBug, isFoodForBug } from "@happy-little-bug-town/utils";

import { addItemToBug } from "../../../api/items";
import { Bug } from "../../../types/bug";
import { Item } from "../../../types/item";
import { DropActionState } from "../../types/dropActionState";

export async function dropFoodOnBug(
  originalItem: Item,
  targetBug: Bug,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (!isFoodForBug(originalItem.itemType, targetBug)) {
    return undefined;
  }

  if (!canDropFoodOnBug(originalItem.itemType, targetBug)) {
    // todo: remove all errors from dropAction - this handler should receive validated parameters
    throw new Error("Item cannot be given to bug");
  }

  const bug = await addItemToBug(originalItem.id, targetBug.id);

  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
    bugs: state.bugs.map((b) => (b.id === targetBug.id ? bug : b)),
  };
}
