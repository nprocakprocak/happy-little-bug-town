import { Position, Positionable } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { DropActionState } from "../types/dropActionState";
import { applyDropActionState } from "./applyDropActionState";
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
import { evolveStructureIfReady } from "./dropActions/evolveStructureIfReady";
import { isBug, isItem, isStack, isStructure } from "./typeGuards";

export async function dropAction(
  targetPosition: Position,
  items: Item[],
  stacks: Stack[],
  bugs: Bug[],
  structures: Structure[],
  entity: Positionable,
  targetEntity: Positionable | undefined,
  queryClient: QueryClient,
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

  const applyResult = (result: DropActionState) => {
    applyDropActionState(queryClient, result);
    return result;
  };

  if (originalItem && targetItem) {
    const crafted = await dropItemOnItemToCraft(originalItem, targetItem, state, queryClient);
    if (crafted) {
      return applyResult(crafted);
    }

    const stacked = await dropItemOnItemToStack(originalItem, targetItem, targetPosition, state);
    if (stacked) {
      return applyResult(stacked);
    }
  }

  if (originalItem && targetStack) {
    const stacked = await dropItemOnStack(originalItem, targetStack, state, queryClient);
    if (stacked) {
      return applyResult(stacked);
    }
  }

  if (originalItem && targetBug) {
    const fed = await dropFoodOnBug(originalItem, targetBug, state, queryClient);
    if (fed) {
      return applyResult(fed);
    }
  }

  if (originalItem && targetStructure) {
    const discarded = await dropItemToDiscard(originalItem, targetStructure, state, queryClient);
    if (discarded) {
      return applyResult(discarded);
    }

    const added = await dropItemOnStructure(originalItem, targetStructure, state, queryClient);
    if (added) {
      return applyResult(added);
    }
  }

  if (originalBug && targetStructure) {
    const discarded = await dropBugToDiscard(originalBug, targetStructure, state, queryClient);
    if (discarded) {
      return applyResult(discarded);
    }

    const added = await dropBugOnStructure(originalBug, targetStructure, state, queryClient);
    if (added) {
      return applyResult(await evolveStructureIfReady(targetStructure, added, queryClient));
    }
  }

  if (originalBug && targetStack) {
    const assigned = await dropBugOnStack(originalBug, targetStack, state, queryClient);
    if (assigned) {
      return applyResult(assigned);
    }
  }

  if (originalStack && targetStack) {
    const merged = await dropStackOnStack(originalStack, targetStack, state, queryClient);
    if (merged) {
      return applyResult(merged);
    }
  }

  const sourceId =
    originalItem?.id ?? originalStack?.id ?? originalBug?.id ?? originalStructure?.id;
  const targetId = targetItem?.id ?? targetStack?.id ?? targetBug?.id ?? targetStructure?.id;

  if (targetEntity) {
    const swapped = await dropToSwap(entity, targetEntity, sourceId, targetId, state, queryClient);
    if (swapped) {
      return applyResult(swapped);
    }

    throw new Error("Invalid drop action");
  }

  if (originalStack) {
    return applyResult(await dropStackOnEmpty(originalStack, targetPosition, state, queryClient));
  }

  if (originalItem) {
    return applyResult(await dropItemOnEmpty(originalItem, targetPosition, state, queryClient));
  }

  if (originalBug) {
    return applyResult(await dropBugOnEmpty(originalBug, targetPosition, state, queryClient));
  }

  if (originalStructure) {
    return applyResult(
      await dropStructureOnEmpty(originalStructure, targetPosition, state, queryClient),
    );
  }

  throw new Error("Invalid drop action");
}
