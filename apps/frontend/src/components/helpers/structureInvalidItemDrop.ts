import {
  canDiscardBugOnStructure,
  canDiscardItemOnStructure,
  canDropBugOnStack,
  canDropItemOnStructure,
  canStructureAcceptDroppedBug,
  droppedBugMustBeFed,
  isBugFed,
  isGroundEvolutionStructureType,
} from "@happy-little-bug-town/utils";

import { Bug } from "../../types/bug";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import type { DragPayload } from "../types/dragPayload";
import { isBug, isItem } from "./typeGuards";

const DROP_FILTER_TRANSITION =
  "transition-[filter,opacity] duration-200 motion-reduce:transition-none";
const DROP_HIGHLIGHT = "brightness-125";

export function structureInvalidDropClass(
  gridDrag: DragPayload | null,
  structure: Structure,
  highlighted = false,
): string {
  return feedbackClass(structureDropAllowed(gridDrag, structure), highlighted);
}

export function stackInvalidDropClass(
  gridDrag: DragPayload | null,
  stack: Stack,
  highlighted = false,
): string {
  return feedbackClass(stackDropAllowed(gridDrag, stack), highlighted);
}

function structureDropAllowed(gridDrag: DragPayload | null, structure: Structure): boolean | null {
  if (!gridDrag || isGroundEvolutionStructureType(structure.structureType)) {
    return null;
  }

  if (isItem(gridDrag.entity)) {
    return (
      canDropItemOnStructure(gridDrag.entity, structure) || canDiscardItemOnStructure(structure)
    );
  }

  if (isBug(gridDrag.entity)) {
    return canDropDraggedBugOnStructure(gridDrag.entity, structure);
  }

  return null;
}

function stackDropAllowed(gridDrag: DragPayload | null, stack: Stack): boolean | null {
  if (!gridDrag) {
    return null;
  }

  if (isItem(gridDrag.entity)) {
    return stack.itemType === gridDrag.entity.itemType;
  }

  if (isBug(gridDrag.entity)) {
    return canDropBugOnStack(gridDrag.entity, stack) && isBugFed(gridDrag.entity);
  }

  return null;
}

function canDropDraggedBugOnStructure(bug: Bug, structure: Structure): boolean {
  if (canStructureAcceptDroppedBug(bug, structure)) {
    return !droppedBugMustBeFed(bug, structure) || isBugFed(bug);
  }

  return canDiscardBugOnStructure(bug, structure);
}

function feedbackClass(canDrop: boolean | null, highlighted: boolean): string {
  if (canDrop === false) {
    return `${DROP_FILTER_TRANSITION} grayscale opacity-50`;
  }

  if (canDrop && highlighted) {
    return `${DROP_FILTER_TRANSITION} ${DROP_HIGHLIGHT}`;
  }

  return DROP_FILTER_TRANSITION;
}
