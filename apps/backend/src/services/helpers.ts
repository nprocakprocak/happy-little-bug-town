import { Item, ItemType } from "../prisma/prisma/client.js";
import { ItemDto, ItemOnGridDto } from "../types/itemDto.js";

export function isItemStackable(itemType: ItemType): boolean {
  return itemType !== "beetle";
}

export function toItemDto(item: Item): ItemDto {
  return {
    id: item.id,
    itemType: item.itemType,
    x: item.x ?? null,
    y: item.y ?? null,
    stackId: item.stackId ?? null,
    authorId: item.authorId,
    stackable: isItemStackable(item.itemType),
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
