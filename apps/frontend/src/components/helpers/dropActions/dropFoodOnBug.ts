import { canDropFoodOnBug, isFoodForBug } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { addItemToBug } from "../../../api/items";
import { Bug } from "../../../types/bug";
import { Item } from "../../../types/item";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

function optimisticDropFoodOnBug(
  originalItem: Item,
  targetBug: Bug,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
    bugs: state.bugs.map((bug) =>
      bug.id === targetBug.id
        ? {
            ...bug,
            items: [...bug.items, { id: originalItem.id, itemType: originalItem.itemType }],
          }
        : bug,
    ),
  };
}

export async function dropFoodOnBug(
  originalItem: Item,
  targetBug: Bug,
  state: DropActionState,
  queryClient: QueryClient,
): Promise<DropActionState | undefined> {
  if (!isFoodForBug(originalItem.itemType, targetBug)) {
    return undefined;
  }

  if (!canDropFoodOnBug(originalItem.itemType, targetBug)) {
    // todo: remove all errors from dropAction - this handler should receive validated parameters
    throw new Error("Item cannot be given to bug");
  }

  applyDropActionState(queryClient, optimisticDropFoodOnBug(originalItem, targetBug, state));

  const bug = await addItemToBug(originalItem.id, targetBug.id);

  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
    bugs: state.bugs.map((b) => (b.id === targetBug.id ? bug : b)),
  };
}
