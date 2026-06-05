import { Item, Stack } from "../prisma/prisma/client.js";

export type StackOnGridDto = Pick<Stack, "id" | "itemType" | "x" | "y"> & {
  itemsCount: number;
};

export type StackDto = StackOnGridDto & Pick<Stack, "authorId">;

export type StackWithItems = Stack & { items: Item[] };
