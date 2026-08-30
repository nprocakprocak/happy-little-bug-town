import { Position } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { updateBugPosition } from "../../../api/bugs";
import { Bug } from "../../../types/bug";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

function optimisticDropBugOnEmpty(
  originalBug: Bug,
  targetPosition: Position,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    bugs: state.bugs.map((b) =>
      b.id === originalBug.id ? { ...b, x: targetPosition.x, y: targetPosition.y } : b,
    ),
  };
}

export async function dropBugOnEmpty(
  originalBug: Bug,
  targetPosition: Position,
  state: DropActionState,
  queryClient: QueryClient,
): Promise<DropActionState> {
  applyDropActionState(queryClient, optimisticDropBugOnEmpty(originalBug, targetPosition, state));

  const bug = await updateBugPosition(originalBug.id, targetPosition);

  return {
    ...state,
    bugs: state.bugs.map((b) => (b.id === originalBug.id ? bug : b)),
  };
}
