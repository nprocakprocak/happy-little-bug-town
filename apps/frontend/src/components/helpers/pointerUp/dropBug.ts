import {
  canDiscardBugOnStructure,
  canDropBugOnStack,
  canStructureAcceptDroppedBug,
  canSwapOnGrid,
  droppedBugMustBeFed,
  isBugFed,
} from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { GridEntity } from "../../../types/gridEntity";
import { isStack, isStructure } from "../typeGuards";

export function dropBug(
  bugToDrop: Bug,
  overlappingEntity: GridEntity | undefined,
): {
  shouldCancel: boolean;
  needsFeeding: boolean;
} {
  const overlappingStack =
    overlappingEntity && isStack(overlappingEntity) ? overlappingEntity : undefined;
  const overlappingStructure =
    overlappingEntity && isStructure(overlappingEntity) ? overlappingEntity : undefined;

  const canDropOnStack = !!overlappingStack && canDropBugOnStack(bugToDrop, overlappingStack);

  const canDiscardOnStructure =
    !!overlappingStructure && canDiscardBugOnStructure(bugToDrop, overlappingStructure);

  if (overlappingStructure && canStructureAcceptDroppedBug(bugToDrop, overlappingStructure)) {
    if (droppedBugMustBeFed(bugToDrop, overlappingStructure) && !isBugFed(bugToDrop)) {
      return { shouldCancel: true, needsFeeding: true };
    }
    return { shouldCancel: false, needsFeeding: false };
  }

  if (canDiscardOnStructure) {
    return { shouldCancel: false, needsFeeding: false };
  }

  if (canDropOnStack) {
    if (!isBugFed(bugToDrop)) {
      return { shouldCancel: true, needsFeeding: true };
    }
    return { shouldCancel: false, needsFeeding: false };
  }

  if (overlappingEntity && canSwapOnGrid(bugToDrop, overlappingEntity)) {
    return { shouldCancel: false, needsFeeding: false };
  }

  if (overlappingEntity) {
    return { shouldCancel: true, needsFeeding: false };
  }

  return { shouldCancel: false, needsFeeding: false };
}
