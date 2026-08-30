import {
  canStructureAcceptDroppedBug,
  droppedBugMustBeFed,
  isBugFed,
} from "@happy-little-bug-town/utils";

import { addBeetleToStructure } from "../../../api/bugs";
import { Bug } from "../../../types/bug";
import { Structure } from "../../../types/structure";
import { ApplyOptimisticDrop, DropActionState } from "../../types/dropActionState";

function optimisticDropBugOnStructure(
  originalBug: Bug,
  targetStructure: Structure,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    bugs: state.bugs.filter((b) => b.id !== originalBug.id),
    structures: state.structures.map((structure) =>
      structure.id === targetStructure.id
        ? {
            ...structure,
            bugs: [...(structure.bugs ?? []), { id: originalBug.id, bugType: originalBug.bugType }],
          }
        : structure,
    ),
  };
}

export async function dropBugOnStructure(
  originalBug: Bug,
  targetStructure: Structure,
  state: DropActionState,
  onOptimisticUpdate: ApplyOptimisticDrop,
): Promise<DropActionState | undefined> {
  if (!canStructureAcceptDroppedBug(originalBug, targetStructure)) {
    return undefined;
  }

  if (droppedBugMustBeFed(originalBug, targetStructure) && !isBugFed(originalBug)) {
    throw new Error("Bug must be fed before joining structure");
  }

  onOptimisticUpdate(optimisticDropBugOnStructure(originalBug, targetStructure, state));

  const structure = await addBeetleToStructure(originalBug.id, targetStructure.id);

  return {
    ...state,
    bugs: state.bugs.filter((b) => b.id !== originalBug.id),
    structures: state.structures.map((s) => (s.id === targetStructure.id ? structure : s)),
  };
}
