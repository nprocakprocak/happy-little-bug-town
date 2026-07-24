import { Item } from "../prisma/prisma/client.js";

export type CreateItemData = Pick<Item, "itemType" | "x" | "y" | "authorId">;

export type UpdateItemData = Partial<
  Pick<Item, "x" | "y" | "stackId" | "bugId" | "structureId" | "toolId" | "parentItemId">
>;

export type ItemOnItem = Pick<Item, "id" | "itemType">;

export type ItemWithItems = Item & { items: Item[] };

export type ItemDto = Pick<
  Item,
  "id" | "itemType" | "x" | "y" | "authorId" | "stackId" | "bugId" | "structureId"
> & {
  items: ItemOnItem[];
};

export type ItemOnGridDto = Pick<Item, "id" | "itemType"> & {
  x: number;
  y: number;
  items: ItemOnItem[];
};
