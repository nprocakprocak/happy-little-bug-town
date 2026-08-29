import { Position, Positionable } from "@happy-little-bug-town/utils";

import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { DropActionState } from "../types/dropActionState";
import { dropBugOnEmpty } from "./dropActions/dropBugOnEmpty";
import { dropBugOnStack } from "./dropActions/dropBugOnStack";
import { dropBugOnStructure } from "./dropActions/dropBugOnStructure";
import { dropBugToDiscard } from "./dropActions/dropBugToDiscard";
import { dropFoodOnBug } from "./dropActions/dropFoodOnBug";
import { dropItemOnEmpty } from "./dropActions/dropItemOnEmpty";
import { dropItemOnItemToCraft } from "./dropActions/dropItemOnItemToCraft";
import { dropItemOnItemToStack } from "./dropActions/dropItemOnItemToStack";
import { dropItemOnStack } from "./dropActions/dropItemOnStack";
import { dropItemOnStructure } from "./dropActions/dropItemOnStructure";
import { dropItemToDiscard } from "./dropActions/dropItemToDiscard";
import { dropStackOnEmpty } from "./dropActions/dropStackOnEmpty";
import { dropStackOnStack } from "./dropActions/dropStackOnStack";
import { dropStructureOnEmpty } from "./dropActions/dropStructureOnEmpty";
import { dropToSwap } from "./dropActions/dropToSwap";
import { isBug, isItem, isStack, isStructure } from "./typeGuards";

export async function dropAction(
  targetPosition: Position,
  items: Item[],
  stacks: Stack[],
  bugs: Bug[],
  structures: Structure[],
  entity: Positionable,
  targetEntity?: Positionable,
): Promise<DropActionState> {
  const originalItem = isItem(entity) ? entity : undefined;
  const originalStack = isStack(entity) ? entity : undefined;
  const originalBug = isBug(entity) ? entity : undefined;
  const originalStructure = isStructure(entity) ? entity : undefined;

  const targetItem = targetEntity && isItem(targetEntity) ? targetEntity : undefined;
  const targetStack = targetEntity && isStack(targetEntity) ? targetEntity : undefined;
  const targetBug = targetEntity && isBug(targetEntity) ? targetEntity : undefined;
  const targetStructure = targetEntity && isStructure(targetEntity) ? targetEntity : undefined;

  const state: DropActionState = { items, stacks, bugs, structures };

  if (originalItem && targetItem) {
    const crafted = await dropItemOnItemToCraft(originalItem, targetItem, state);
    if (crafted) {
      return crafted;
    }

    const stacked = await dropItemOnItemToStack(originalItem, targetItem, targetPosition, state);
    if (stacked) {
      return stacked;
    }
  }

  if (originalItem && targetStack) {
    const stacked = await dropItemOnStack(originalItem, targetStack, state);
    if (stacked) {
      return stacked;
    }
  }

  if (originalItem && targetBug) {
    const fed = await dropFoodOnBug(originalItem, targetBug, state);
    if (fed) {
      return fed;
    }
  }

  if (originalItem && targetStructure) {
    const discarded = await dropItemToDiscard(originalItem, targetStructure, state);
    if (discarded) {
      return discarded;
    }

    const added = await dropItemOnStructure(originalItem, targetStructure, state);
    if (added) {
      return added;
    }
  }

  if (originalBug && targetStructure) {
    const discarded = await dropBugToDiscard(originalBug, targetStructure, state);
    if (discarded) {
      return discarded;
    }

    const added = await dropBugOnStructure(originalBug, targetStructure, state);
    if (added) {
      return added;
    }
  }

  if (originalBug && targetStack) {
    const assigned = await dropBugOnStack(originalBug, targetStack, state);
    if (assigned) {
      return assigned;
    }
  }

  if (originalStack && targetStack) {
    const merged = await dropStackOnStack(originalStack, targetStack, state);
    if (merged) {
      return merged;
    }
  }

  const sourceId =
    originalItem?.id ?? originalStack?.id ?? originalBug?.id ?? originalStructure?.id;
  const targetId = targetItem?.id ?? targetStack?.id ?? targetBug?.id ?? targetStructure?.id;

  if (targetEntity) {
    const swapped = await dropToSwap(entity, targetEntity, sourceId, targetId, state);
    if (swapped) {
      return swapped;
    }

    throw new Error("Invalid drop action");
  }

  if (originalStack) {
    return dropStackOnEmpty(originalStack, targetPosition, state);
  }

  if (originalItem) {
    return dropItemOnEmpty(originalItem, targetPosition, state);
  }

  if (originalBug) {
    return dropBugOnEmpty(originalBug, targetPosition, state);
  }

  if (originalStructure) {
    return dropStructureOnEmpty(originalStructure, targetPosition, state);
  }

  throw new Error("Invalid drop action");
}
