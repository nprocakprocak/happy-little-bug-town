import { isBugFed, isItemCrafted, Positionable } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { Bug } from "../../types/bug";
import { Dialogue } from "../../types/dialogue";
import { GridEntity } from "../../types/gridEntity";
import { Item } from "../../types/item";
import { clickStack } from "./clickActions/clickStack";
import { clickStructure } from "./clickActions/clickStructure";
import { spawnExtractedBug, spawnExtractedItem } from "./clickActions/spawnExtractedEntity";
import { isBug, isItem, isStack, isStructure } from "./typeGuards";
import { flyDialogue } from "../../utils/dialogue";

interface ClickActionArgs {
  entity: GridEntity;
  queryClient: QueryClient;
  rows: number;
  cols: number;
  animatables: Positionable[];
  items: Item[];
  isDemolishMode: boolean;
  beginAutoRouteIfPossible: Parameters<typeof spawnExtractedItem>[3];
  beginAutoRouteBugIfPossible: Parameters<typeof spawnExtractedBug>[3];
}

type ClickActionResult =
  | Awaited<ReturnType<typeof clickStructure>>
  | { kind: "done" }
  | { kind: "noop" }
  | { kind: "toggleDemolish" }
  | { kind: "selectBug"; bug: Bug }
  | { kind: "showDialogue"; dialogue: Dialogue };

export async function clickAction({
  entity,
  queryClient,
  rows,
  cols,
  animatables,
  items,
  isDemolishMode,
  beginAutoRouteIfPossible,
  beginAutoRouteBugIfPossible,
}: ClickActionArgs): Promise<ClickActionResult> {
  if (isStructure(entity)) {
    return clickStructure({
      structure: entity,
      queryClient,
      rows,
      cols,
      animatables,
      items,
      isDemolishMode,
      beginAutoRouteIfPossible,
      beginAutoRouteBugIfPossible,
    });
  }

  if (isStack(entity)) {
    await clickStack(entity, queryClient, beginAutoRouteIfPossible);
    return { kind: "done" };
  }

  if (isItem(entity) && entity.itemType === "hammer" && isItemCrafted(entity)) {
    return { kind: "toggleDemolish" };
  }

  if (isBug(entity) && entity.bugType === "fly") {
    return { kind: "showDialogue", dialogue: flyDialogue() };
  }

  if (
    isBug(entity) &&
    (entity.bugType === "beetle" ||
      entity.bugType === "ladybug" ||
      (entity.bugType === "greenfly" && !isBugFed(entity)))
  ) {
    return { kind: "selectBug", bug: entity };
  }

  return { kind: "noop" };
}
