import { Positionable } from "@happy-little-park/utils";

import { getBugs } from "../services/bugsService.js";
import { getItemsOnGrid } from "../services/itemsService.js";
import { getStacks } from "../services/stacksService.js";
import { getStructures } from "../services/structuresService.js";
import { isPositioned } from "../typeGuards/items.js";

export async function getAllEntitiesOnGrid(authorId: string): Promise<Positionable[]> {
  const [structures, items, stacks, bugs] = await Promise.all([
    getStructures(authorId),
    getItemsOnGrid(authorId),
    getStacks(authorId),
    getBugs(authorId),
  ]);

  return [...structures, ...items, ...stacks, ...bugs].filter(isPositioned) as Positionable[];
}
