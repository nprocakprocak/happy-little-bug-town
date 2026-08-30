import { Position } from "@happy-little-bug-town/utils";

import { updateStructure } from "../../../api/structures";
import { Structure } from "../../../types/structure";
import { ApplyOptimisticDrop, DropActionState } from "../../types/dropActionState";

function optimisticDropStructureOnEmpty(
  originalStructure: Structure,
  targetPosition: Position,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    structures: state.structures.map((s) =>
      s.id === originalStructure.id ? { ...s, x: targetPosition.x, y: targetPosition.y } : s,
    ),
  };
}

export async function dropStructureOnEmpty(
  originalStructure: Structure,
  targetPosition: Position,
  state: DropActionState,
  onOptimisticUpdate: ApplyOptimisticDrop,
): Promise<DropActionState> {
  onOptimisticUpdate(optimisticDropStructureOnEmpty(originalStructure, targetPosition, state));

  const structure = await updateStructure(originalStructure.id, targetPosition);

  return {
    ...state,
    structures: state.structures.map((s) => (s.id === originalStructure.id ? structure : s)),
  };
}
