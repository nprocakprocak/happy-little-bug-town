import { Item } from "../prisma/prisma/client.js";

export type CreateItemData = Pick<Item, "itemType" | "x" | "y" | "authorId"> & {
  stackable: boolean;
};

export type UpdateItemData = Partial<Pick<Item, "x" | "y" | "stackId">>;

// todo: create StackDto
export type ItemDto = Pick<Item, "id" | "itemType" | "x" | "y" | "authorId" | "stackId"> & { stackable: boolean };

export type ItemOnGridDto = Pick<Item, "id" | "itemType"> & { x: number, y: number, stackable: boolean };
