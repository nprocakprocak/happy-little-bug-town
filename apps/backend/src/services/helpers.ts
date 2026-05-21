import { Item, ItemType } from "../prisma/prisma/client.js";
import { ItemDto } from "../types/itemDto.js";

export function isItemStackable(itemType: ItemType): boolean {
  return itemType !== "beetle";
}

export function toItemDto(item: Item): ItemDto {
  return {
    id: item.id,
    itemType: item.itemType,
    x: item.x ?? null,
    y: item.y ?? null,
    authorId: item.authorId,
    stackable: isItemStackable(item.itemType),
  };
}
