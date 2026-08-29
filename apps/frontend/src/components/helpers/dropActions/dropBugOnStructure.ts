import {
  canStructureAcceptDroppedBug,
  droppedBugMustBeFed,
  isBugFed,
} from "@happy-little-bug-town/utils";

import { addBeetleToStructure } from "../../../api/bugs";
import { Bug } from "../../../types/bug";
import { Structure } from "../../../types/structure";
import { DropActionState } from "../../types/dropActionState";

export async function dropBugOnStructure(
  originalBug: Bug,
  targetStructure: Structure,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (!canStructureAcceptDroppedBug(originalBug, targetStructure)) {
    return undefined;
  }

  if (droppedBugMustBeFed(originalBug, targetStructure) && !isBugFed(originalBug)) {
    throw new Error("Bug must be fed before joining structure");
  }

  const structure = await addBeetleToStructure(originalBug.id, targetStructure.id);

  return {
    ...state,
    bugs: state.bugs.filter((b) => b.id !== originalBug.id),
    structures: state.structures.map((s) => (s.id === targetStructure.id ? structure : s)),
  };
}
