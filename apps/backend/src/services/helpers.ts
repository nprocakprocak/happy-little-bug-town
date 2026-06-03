import { Bug, Item, ItemType } from "../prisma/prisma/client.js";
import { BugDto, BugOnGridDto } from "../types/bugDto.js";
import { ItemDto, ItemOnGridDto } from "../types/itemDto.js";
import { StructureDto, StructureWithItems } from "../types/structureDto.js";

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
    items: structure.items.map(toItemDto),
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
