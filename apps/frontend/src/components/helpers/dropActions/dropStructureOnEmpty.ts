import { Position } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { updateStructure } from "../../../api/structures";
import { Structure } from "../../../types/structure";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

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
  queryClient: QueryClient,
): Promise<DropActionState> {
  applyDropActionState(
    queryClient,
    optimisticDropStructureOnEmpty(originalStructure, targetPosition, state),
  );

  const structure = await updateStructure(originalStructure.id, targetPosition);

  return {
    ...state,
    structures: state.structures.map((s) => (s.id === originalStructure.id ? structure : s)),
  };
}
