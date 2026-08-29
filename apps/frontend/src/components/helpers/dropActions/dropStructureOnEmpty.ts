import { Position } from "@happy-little-bug-town/utils";

import { updateStructure } from "../../../api/structures";
import { Structure } from "../../../types/structure";
import { DropActionState } from "../../types/dropActionState";

export async function dropStructureOnEmpty(
  originalStructure: Structure,
  targetPosition: Position,
  state: DropActionState,
): Promise<DropActionState> {
  const structure = await updateStructure(originalStructure.id, targetPosition);

  return {
    ...state,
    structures: state.structures.map((s) => (s.id === originalStructure.id ? structure : s)),
  };
}
