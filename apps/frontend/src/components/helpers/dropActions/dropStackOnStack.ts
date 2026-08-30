import { canDropBugOnStack, canStackItemType } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { mergeStacks } from "../../../api/stacks";
import { Stack } from "../../../types/stack";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

function optimisticDropStackOnStack(
  originalStack: Stack,
  targetStack: Stack,
  state: DropActionState,
): DropActionState {
  const source = state.stacks.find((s) => s.id === originalStack.id);
  if (!source) {
    throw new Error("Source stack not found");
  }

  const sourceBugs = source.bugs ?? [];
  const canTransferSourceBugs =
    sourceBugs.length === 1 && canDropBugOnStack(sourceBugs[0], targetStack);
  const shouldDropSourceBugs = sourceBugs.length > 0 && !canTransferSourceBugs;

  return {
    ...state,
    stacks: state.stacks
      .filter((s) => s.id !== originalStack.id)
      .map((s) =>
        s.id === targetStack.id
          ? {
              ...s,
              itemsCount: s.itemsCount + source.itemsCount,
              bugs: canTransferSourceBugs ? [...(s.bugs ?? []), ...sourceBugs] : (s.bugs ?? []),
            }
          : s,
      ),
    bugs: shouldDropSourceBugs
      ? [
          ...state.bugs,
          ...sourceBugs.map((bug) => ({
            id: bug.id,
            bugType: bug.bugType,
            x: originalStack.x,
            y: originalStack.y,
            fromX: targetStack.x,
            fromY: targetStack.y,
            items: [],
          })),
        ]
      : state.bugs,
  };
}

export async function dropStackOnStack(
  originalStack: Stack,
  targetStack: Stack,
  state: DropActionState,
  queryClient: QueryClient,
): Promise<DropActionState | undefined> {
  if (originalStack.itemType !== targetStack.itemType) {
    return undefined;
  }

  if (!canStackItemType(originalStack.itemType, state.items)) {
    return undefined;
  }

  applyDropActionState(queryClient, optimisticDropStackOnStack(originalStack, targetStack, state));

  const { stack: mergedStack, releasedBugs } = await mergeStacks(originalStack.id, targetStack.id);

  return {
    ...state,
    stacks: state.stacks
      .filter((s) => s.id !== originalStack.id)
      .map((s) => (s.id === targetStack.id ? mergedStack : s)),
    bugs: [
      ...state.bugs,
      ...releasedBugs.map((bug) => ({
        ...bug,
        fromX: targetStack.x,
        fromY: targetStack.y,
      })),
    ],
  };
}
