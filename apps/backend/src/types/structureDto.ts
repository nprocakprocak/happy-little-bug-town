import { BuildableStructureType } from "@happy-little-park/utils";
import { Bug, Item, Structure } from "../prisma/prisma/client.js";

export type CreateStructureData = {
  authorId: string;
  structureType: BuildableStructureType;
  x: number;
  y: number;
};

export type ItemOnStructure = Pick<Item, "id" | "itemType">;

export type BugOnStructure = Pick<Bug, "id" | "bugType">;

export type StructureDto = Pick<
  Structure,
  "id" | "structureType" | "x" | "y" | "span" | "authorId"
> & {
  items: ItemOnStructure[];
  bugs: BugOnStructure[];
};

export type StructureWithItems = Structure & { items: Item[]; bugs: Bug[] };
