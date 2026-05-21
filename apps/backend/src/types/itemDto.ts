import { Item } from "../prisma/prisma/client.js";

export type CreateItemDto = Pick<Item, "itemType" | "x" | "y" | "authorId"> & {
  stackable: boolean;
};

export type ItemDto = CreateItemDto & { id: string };
