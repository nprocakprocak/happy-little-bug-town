import { Position } from "@happy-little-bug-town/utils";

import { updateStack } from "../../../api/stacks";
import { Stack } from "../../../types/stack";
import { DropActionState } from "../../types/dropActionState";

export async function dropStackOnEmpty(
  originalStack: Stack,
  targetPosition: Position,
  state: DropActionState,
): Promise<DropActionState> {
  const stack = await updateStack(originalStack.id, targetPosition);

  return {
    ...state,
    stacks: state.stacks.map((s) => (s.id === originalStack.id ? stack : s)),
  };
}
