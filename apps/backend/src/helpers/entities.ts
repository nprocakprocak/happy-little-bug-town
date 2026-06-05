import { Position, Positionable } from "@happy-little-park/utils";

import { getBugs } from "../services/bugsService.js";
import { getItemsOnGrid } from "../services/itemsService.js";
import { getStacks } from "../services/stacksService.js";
import { getStructures } from "../services/structuresService.js";
import { getTools } from "../services/toolsService.js";
import { isPositioned } from "../typeGuards/items.js";

export async function getAllEntitiesOnGrid(authorId: string): Promise<Positionable[]> {
  const [structures, items, stacks, bugs, tools] = await Promise.all([
    getStructures(authorId),
    getItemsOnGrid(authorId),
    getStacks(authorId),
    getBugs(authorId),
    getTools(authorId),
  ]);

  return [...structures, ...items, ...stacks, ...bugs, ...tools].filter(isPositioned) as Positionable[];
}
