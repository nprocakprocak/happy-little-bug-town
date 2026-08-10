import { Bug, Item } from "../prisma/prisma/client.js";
import { BugDto, BugOnGridDto } from "../types/bugDto.js";
import { ItemDto, ItemOnGridDto, ItemWithItems } from "../types/itemDto.js";
import { StackDto, StackOnGridDto, StackWithItems } from "../types/stackDto.js";
import { StructureDto, StructureOnGridDto, StructureWithItems } from "../types/structureDto.js";

export function toItemDto(item: ItemWithItems): ItemDto {
  return {
    id: item.id,
    itemType: item.itemType,
    x: item.x ?? null,
    y: item.y ?? null,
    stackId: item.stackId ?? null,
    bugId: item.bugId ?? null,
    structureId: item.structureId ?? null,
    authorId: item.authorId,
    items: item.items.map((craftItem) => ({ id: craftItem.id, itemType: craftItem.itemType })),
  };
}

export function toStructureDto(structure: StructureWithItems): StructureDto {
  return {
    id: structure.id,
    structureType: structure.structureType,
    x: structure.x,
    y: structure.y,
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
    items: item.items,
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
