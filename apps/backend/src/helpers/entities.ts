import { getStackSpan, getStructureSpan, getToolSpan, Positionable } from "@happy-little-bug-town/utils";

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

  return [
    ...structures.map((structure) => ({
      ...structure,
      span: getStructureSpan(structure.structureType),
    })),
    ...items,
    ...stacks.map((stack) => ({ ...stack, span: getStackSpan() })),
    ...bugs,
    ...tools.map((tool) => ({ ...tool, span: getToolSpan(tool.toolType) })),
  ].filter(isPositioned) as Positionable[];
}
