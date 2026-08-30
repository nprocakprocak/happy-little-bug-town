import { Position } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { updateStack } from "../../../api/stacks";
import { Stack } from "../../../types/stack";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

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
  queryClient: QueryClient,
): Promise<DropActionState> {
  applyDropActionState(
    queryClient,
    optimisticDropStackOnEmpty(originalStack, targetPosition, state),
  );

  const stack = await updateStack(originalStack.id, targetPosition);

  return {
    ...state,
    stacks: state.stacks.map((s) => (s.id === originalStack.id ? stack : s)),
  };
}
