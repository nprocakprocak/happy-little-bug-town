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

export function shouldCancelBugDrop(
  bug: Bug,
  overlapping: GridEntity | undefined,
): "cancel" | "hungryBug" | null {
  if (!overlapping) {
    return null;
  }

  if (!canDropBugOnTarget(bug, overlapping)) {
    return "cancel";
  }

  if (mustFeedBugBeforeDrop(bug, overlapping)) {
    return "hungryBug";
  }

  return null;
}

function canDropBugOnTarget(bug: Bug, overlapping: GridEntity): boolean {
  if (isStructure(overlapping)) {
    return (
      canStructureAcceptDroppedBug(bug, overlapping) ||
      canDiscardBugOnStructure(bug, overlapping) ||
      canSwapOnGrid(bug, overlapping)
    );
  }

  if (isStack(overlapping)) {
    return canDropBugOnStack(bug, overlapping) || canSwapOnGrid(bug, overlapping);
  }

  return canSwapOnGrid(bug, overlapping);
}

function mustFeedBugBeforeDrop(bug: Bug, overlapping: GridEntity): boolean {
  if (isStructure(overlapping) && canStructureAcceptDroppedBug(bug, overlapping)) {
    return droppedBugMustBeFed(bug, overlapping) && !isBugFed(bug);
  }

  if (isStack(overlapping) && canDropBugOnStack(bug, overlapping)) {
    return !isBugFed(bug);
  }

  return false;
}
