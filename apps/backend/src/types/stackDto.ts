import { Item, Stack } from "../prisma/prisma/client.js";

export type StackOnGridDto = Pick<Stack, "id" | "itemType" | "x" | "y"> & {
  span: number;
  itemsCount: number;
};

export type StackDto = Omit<StackOnGridDto, "span"> & Pick<Stack, "authorId">;

export type StackWithItems = Stack & { items: Item[] };
