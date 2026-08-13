import { ItemDto, ItemOnGridDto, ItemWithItems } from "../types/itemDto.js";

export function toItemDto(item: ItemWithItems): ItemDto {
  return {
    id: item.id,
    itemType: item.itemType,
    x: item.x ?? null,
    y: item.y ?? null,
    stackId: item.stackId ?? null,
    bugId: item.bugId ?? null,
    structureId: item.structureId ?? null,
    parentItemId: item.parentItemId ?? null,
    authorId: item.authorId,
    items: item.items.map((craftItem) => ({ id: craftItem.id, itemType: craftItem.itemType })),
  };
}

export function toItemOnGridDto(item: ItemDto): ItemOnGridDto {
  if (item.x == null || item.y == null) {
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
