import { Item, Structure } from "../prisma/prisma/client.js";
import { ItemDto } from "./itemDto.js";

export type CreateStructureData = {
  authorId: string;
  structureType: "beetle_house";
  x: number;
  y: number;
};

export type ItemOnStructure = Pick<Item, "id" | "itemType">;

export type StructureDto = Pick<
  Structure,
  "id" | "structureType" | "x" | "y" | "span" | "authorId"
> & {
  items: ItemOnStructure[];
};

export type StructureWithItems = Structure & { items: Item[] };
