import { isBugFed, isItemCrafted, Positionable } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { Dialogue } from "../../types/dialogue";
import { GridEntity } from "../../types/gridEntity";
import { Item } from "../../types/item";
import {
  bugClickDialogue,
  hungryBugDialogue,
  itemClickDialogue,
  structureClickDialogue,
} from "../../utils/dialogue";
import { clickStack } from "./clickActions/clickStack";
import { clickStructure } from "./clickActions/clickStructure";
import { spawnExtractedBug, spawnExtractedItem } from "./clickActions/spawnExtractedEntity";
import { isBug, isItem, isStack, isStructure } from "./typeGuards";

interface ClickActionArgs {
  entity: GridEntity;
  queryClient: QueryClient;
  rows: number;
  cols: number;
  entities: Positionable[];
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
  | { kind: "openBuildPopup" }
  | { kind: "openUpgradePopup" }
  | { kind: "showDialogue"; dialogue: Dialogue };

export async function clickAction({
  entity,
  queryClient,
  rows,
  cols,
  entities,
  items,
  isDemolishMode,
  beginAutoRouteIfPossible,
  beginAutoRouteBugIfPossible,
}: ClickActionArgs): Promise<ClickActionResult> {
  if (isStructure(entity)) {
    const result = await clickStructure({
      structure: entity,
      queryClient,
      rows,
      cols,
      entities,
      items,
      isDemolishMode,
      beginAutoRouteIfPossible,
      beginAutoRouteBugIfPossible,
    });
    if (result.kind === "noop") {
      const dialogue = structureClickDialogue(entity.structureType);
      if (dialogue) {
        return { kind: "showDialogue", dialogue };
      }
    }
    return result;
  }

  if (isStack(entity)) {
    return clickStack({
      stack: entity,
      queryClient,
      beginAutoRouteIfPossible,
      rows,
      cols,
      entities,
    });
  }

  if (isItem(entity)) {
    if (entity.itemType === "hammer" && isItemCrafted(entity)) {
      return { kind: "toggleDemolish" };
    }
    const dialogue = itemClickDialogue(entity.itemType);
    if (dialogue) {
      return { kind: "showDialogue", dialogue };
    }
  }

  if (isBug(entity)) {
    const isHungry = !isBugFed(entity);
    if (isHungry) {
      const dialogue = hungryBugDialogue(entity);
      if (dialogue) {
        return { kind: "showDialogue", dialogue };
      }
    }

    if (entity.bugType === "beetle") {
      return { kind: "openBuildPopup" };
    }

    if (entity.bugType === "ladybug") {
      return { kind: "openUpgradePopup" };
    }

    const dialogue = bugClickDialogue(entity.bugType);
    if (dialogue) {
      return { kind: "showDialogue", dialogue };
    }
  }

  return { kind: "noop" };
}
