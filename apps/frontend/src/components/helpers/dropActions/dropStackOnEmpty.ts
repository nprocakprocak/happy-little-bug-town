import { Position } from "@happy-little-bug-town/utils";

import { updateStack } from "../../../api/stacks";
import { Stack } from "../../../types/stack";
import { ApplyOptimisticDrop, DropActionState } from "../../types/dropActionState";

function optimisticDropStackOnEmpty(
  originalStack: Stack,
  targetPosition: Position,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    stacks: state.stacks.map((s) =>
      s.id === originalStack.id ? { ...s, x: targetPosition.x, y: targetPosition.y } : s,
    ),
  };
}

export async function dropStackOnEmpty(
  originalStack: Stack,
  targetPosition: Position,
  state: DropActionState,
  onOptimisticUpdate: ApplyOptimisticDrop,
): Promise<DropActionState> {
  onOptimisticUpdate(optimisticDropStackOnEmpty(originalStack, targetPosition, state));

  const stack = await updateStack(originalStack.id, targetPosition);

  return {
    ...state,
    stacks: state.stacks.map((s) => (s.id === originalStack.id ? stack : s)),
  };
}
