import { Positionable } from "@happy-little-park/utils";
import { getBugs } from "../services/bugsService.js";
import { getItems } from "../services/itemsService.js";
import { getStacks } from "../services/stacksService.js";
import { getStructures } from "../services/structuresService.js";
import { isPositioned } from "../typeGuards/items.js";

export async function getAllEntitiesOnGrid(authorId: string): Promise<Positionable[]> {
  const structures = await getStructures(authorId);
  const items = await getItems(authorId);
  const stacks = await getStacks(authorId);
  const bugs = await getBugs(authorId);
  return [...structures, ...items, ...stacks, ...bugs].filter(isPositioned) as Positionable[];
}
