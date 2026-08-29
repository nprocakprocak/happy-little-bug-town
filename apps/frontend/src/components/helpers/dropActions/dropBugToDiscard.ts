import { canDiscardBugOnStructure } from "@happy-little-bug-town/utils";

import { deleteBug } from "../../../api/bugs";
import { Bug } from "../../../types/bug";
import { Structure } from "../../../types/structure";
import { DropActionState } from "../../types/dropActionState";

export async function dropBugToDiscard(
  originalBug: Bug,
  targetStructure: Structure,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (!canDiscardBugOnStructure(originalBug, targetStructure)) {
    return undefined;
  }

  await deleteBug(originalBug.id, targetStructure.id);

  return {
    ...state,
    bugs: state.bugs.filter((b) => b.id !== originalBug.id),
  };
}
