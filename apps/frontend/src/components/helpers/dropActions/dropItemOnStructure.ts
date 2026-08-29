import { canDropItemOnStructure } from "@happy-little-bug-town/utils";

import { addItemToStructure } from "../../../api/items";
import { Item } from "../../../types/item";
import { Structure } from "../../../types/structure";
import { DropActionState } from "../../types/dropActionState";

export async function dropItemOnStructure(
  originalItem: Item,
  targetStructure: Structure,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (!canDropItemOnStructure(originalItem, targetStructure)) {
    return undefined;
  }

  const structure = await addItemToStructure(originalItem.id, targetStructure.id);

  return {
    ...state,
    items: state.items.filter((it) => it.id !== originalItem.id),
    structures: state.structures.map((s) => (s.id === targetStructure.id ? structure : s)),
  };
}
