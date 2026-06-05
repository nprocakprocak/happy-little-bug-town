import { Bug, Item, ItemType, Tool } from "../prisma/prisma/client.js";
import { BugDto, BugOnGridDto } from "../types/bugDto.js";
import { ItemDto, ItemOnGridDto } from "../types/itemDto.js";
import { StackDto, StackOnGridDto, StackWithItems } from "../types/stackDto.js";
import { StructureDto, StructureOnGridDto, StructureWithItems } from "../types/structureDto.js";
import { ToolDto } from "../types/toolDto.js";

export function isItemStackable(itemType: ItemType): boolean {
  // perhaps will be false for some items
  return true;
}

export function toItemDto(item: Item): ItemDto {
  return {
    id: item.id,
    itemType: item.itemType,
    x: item.x ?? null,
    y: item.y ?? null,
    stackId: item.stackId ?? null,
    bugId: item.bugId ?? null,
    structureId: item.structureId ?? null,
    authorId: item.authorId,
    stackable: isItemStackable(item.itemType),
  };
}

export function toStructureDto(structure: StructureWithItems): StructureDto {
  return {
    id: structure.id,
    structureType: structure.structureType,
    x: structure.x,
    y: structure.y,
    span: structure.span,
    authorId: structure.authorId,
    items: structure.items.map((item) => ({ id: item.id, itemType: item.itemType })),
    bugs: structure.bugs.map((bug) => ({ id: bug.id, bugType: bug.bugType })),
  };
}

export function toStructureOnGridDto(structure: StructureDto): StructureOnGridDto {
  return {
    id: structure.id,
    structureType: structure.structureType,
    x: structure.x,
    y: structure.y,
    span: structure.span,
    items: structure.items,
    bugs: structure.bugs,
  };
}

export function toStackDto(stack: StackWithItems): StackDto {
  return {
    id: stack.id,
    itemType: stack.itemType,
    x: stack.x,
    y: stack.y,
    authorId: stack.authorId,
    itemsCount: stack.items.length,
  };
}

export function toStackOnGridDto(stack: StackDto): StackOnGridDto {
  return {
    id: stack.id,
    itemType: stack.itemType,
    x: stack.x,
    y: stack.y,
    itemsCount: stack.itemsCount,
  };
}

export function toItemOnGridDto(item: ItemDto): ItemOnGridDto {
  if (!item.x || !item.y) {
    throw new Error(`Item ${item.id} is not on a grid`);
  }

  return {
    id: item.id,
    itemType: item.itemType,
    x: item.x,
    y: item.y,
    stackable: item.stackable,
  };
}

export function toBugDto(bug: Bug & { items: Item[] }): BugDto {
  return {
    id: bug.id,
    bugType: bug.bugType,
    x: bug.x,
    y: bug.y,
    authorId: bug.authorId,
    structureId: bug.structureId,
    itemIds: bug.items.map((item) => item.id),
  };
}

export function toBugOnGridDto(bug: BugDto): BugOnGridDto {
  if (!bug.x || !bug.y) {
    throw new Error(`Bug ${bug.id} is not on a grid`);
  }

  return {
    id: bug.id,
    bugType: bug.bugType,
    x: bug.x,
    y: bug.y,
    itemIds: bug.itemIds,
  };
}

export function toToolDto(tool: Tool & { items: Item[] }): ToolDto {
  return {
    id: tool.id,
    toolType: tool.toolType,
    x: tool.x,
    y: tool.y,
    authorId: tool.authorId,
    structureId: tool.structureId,
    itemIds: tool.items.map((item) => item.id),
  };
}
