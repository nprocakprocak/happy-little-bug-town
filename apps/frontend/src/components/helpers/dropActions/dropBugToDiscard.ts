import { canDiscardBugOnStructure } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { deleteBug } from "../../../api/bugs";
import { Bug } from "../../../types/bug";
import { Structure } from "../../../types/structure";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

function optimisticDropBugToDiscard(originalBug: Bug, state: DropActionState): DropActionState {
  return {
    ...state,
    bugs: state.bugs.filter((b) => b.id !== originalBug.id),
  };
}

export async function dropBugToDiscard(
  originalBug: Bug,
  targetStructure: Structure,
  state: DropActionState,
  queryClient: QueryClient,
): Promise<DropActionState | undefined> {
  if (!canDiscardBugOnStructure(originalBug, targetStructure)) {
    return undefined;
  }

  applyDropActionState(queryClient, optimisticDropBugToDiscard(originalBug, state));

  await deleteBug(originalBug.id, targetStructure.id);

  return optimisticDropBugToDiscard(originalBug, state);
}
