import { canStackItemType } from "@happy-little-bug-town/utils";

import { mergeStacks } from "../../../api/stacks";
import { Stack } from "../../../types/stack";
import { DropActionState } from "../../types/dropActionState";

export async function dropStackOnStack(
  originalStack: Stack,
  targetStack: Stack,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (originalStack.itemType !== targetStack.itemType) {
    return undefined;
  }

  if (!canStackItemType(originalStack.itemType, state.items)) {
    return undefined;
  }

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
