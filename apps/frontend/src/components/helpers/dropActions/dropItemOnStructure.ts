import { canDropItemOnStructure } from "@happy-little-bug-town/utils";

import { addItemToStructure } from "../../../api/items";
import { Item } from "../../../types/item";
import { Structure } from "../../../types/structure";
import { ApplyOptimisticDrop, DropActionState } from "../../types/dropActionState";

function optimisticDropItemOnStructure(
  originalItem: Item,
  targetStructure: Structure,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
    structures: state.structures.map((structure) =>
      structure.id === targetStructure.id
        ? {
            ...structure,
            items: [...structure.items, { id: originalItem.id, itemType: originalItem.itemType }],
          }
        : structure,
    ),
  };
}

export async function dropItemOnStructure(
  originalItem: Item,
  targetStructure: Structure,
  state: DropActionState,
  onOptimisticUpdate: ApplyOptimisticDrop,
): Promise<DropActionState | undefined> {
  if (!canDropItemOnStructure(originalItem, targetStructure)) {
    return undefined;
  }

  onOptimisticUpdate(optimisticDropItemOnStructure(originalItem, targetStructure, state));

  const structure = await addItemToStructure(originalItem.id, targetStructure.id);

  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
    structures: state.structures.map((s) => (s.id === targetStructure.id ? structure : s)),
  };
}
