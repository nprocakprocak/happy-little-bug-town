import { canDropBugOnStack, isBugFed } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { addBugToStack } from "../../../api/bugs";
import { Bug } from "../../../types/bug";
import { Stack } from "../../../types/stack";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

function optimisticDropBugOnStack(
  originalBug: Bug,
  targetStack: Stack,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    bugs: state.bugs.filter((b) => b.id !== originalBug.id),
    stacks: state.stacks.map((s) =>
      s.id === targetStack.id
        ? {
            ...s,
            bugs: [...(s.bugs ?? []), { id: originalBug.id, bugType: originalBug.bugType }],
          }
        : s,
    ),
  };
}

export async function dropBugOnStack(
  originalBug: Bug,
  targetStack: Stack,
  state: DropActionState,
  queryClient: QueryClient,
): Promise<DropActionState | undefined> {
  if (!canDropBugOnStack(originalBug, targetStack)) {
    return undefined;
  }

  if (!isBugFed(originalBug)) {
    throw new Error("Bug must be fed before joining stack");
  }

  applyDropActionState(queryClient, optimisticDropBugOnStack(originalBug, targetStack, state));

  const stack = await addBugToStack(originalBug.id, targetStack.id);

  return {
    ...state,
    stacks: state.stacks.map((s) => (s.id === targetStack.id ? stack : s)),
    bugs: state.bugs.filter((b) => b.id !== originalBug.id),
  };
}
