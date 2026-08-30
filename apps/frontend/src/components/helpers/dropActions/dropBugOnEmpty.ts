import { Position } from "@happy-little-bug-town/utils";

import { updateBugPosition } from "../../../api/bugs";
import { Bug } from "../../../types/bug";
import { ApplyOptimisticDrop, DropActionState } from "../../types/dropActionState";

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
  onOptimisticUpdate: ApplyOptimisticDrop,
): Promise<DropActionState> {
  onOptimisticUpdate(optimisticDropBugOnEmpty(originalBug, targetPosition, state));

  const bug = await updateBugPosition(originalBug.id, targetPosition);

  return {
    ...state,
    bugs: state.bugs.map((b) => (b.id === originalBug.id ? bug : b)),
  };
}
