import { canDropBugOnStack, isBugFed } from "@happy-little-bug-town/utils";

import { addBugToStack } from "../../../api/bugs";
import { Bug } from "../../../types/bug";
import { Stack } from "../../../types/stack";
import { ApplyOptimisticDrop, DropActionState } from "../../types/dropActionState";

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
  onOptimisticUpdate: ApplyOptimisticDrop,
): Promise<DropActionState | undefined> {
  if (!canDropBugOnStack(originalBug, targetStack)) {
    return undefined;
  }

  if (!isBugFed(originalBug)) {
    throw new Error("Bug must be fed before joining stack");
  }

  onOptimisticUpdate(optimisticDropBugOnStack(originalBug, targetStack, state));

  const stack = await addBugToStack(originalBug.id, targetStack.id);

  return {
    ...state,
    stacks: state.stacks.map((s) => (s.id === targetStack.id ? stack : s)),
    bugs: state.bugs.filter((b) => b.id !== originalBug.id),
  };
}
