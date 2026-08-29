import { Position } from "@happy-little-bug-town/utils";

import { updateBugPosition } from "../../../api/bugs";
import { Bug } from "../../../types/bug";
import { DropActionState } from "../../types/dropActionState";

export async function dropBugOnEmpty(
  originalBug: Bug,
  targetPosition: Position,
  state: DropActionState,
): Promise<DropActionState> {
  const bug = await updateBugPosition(originalBug.id, targetPosition);

  return {
    ...state,
    bugs: state.bugs.map((b) => (b.id === originalBug.id ? bug : b)),
  };
}
