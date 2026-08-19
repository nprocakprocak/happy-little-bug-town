import { BuildableStructureType } from "@happy-little-bug-town/utils";

import { Bug, Item, Structure } from "../prisma/prisma/client.js";

export type CreateStructureData = {
  authorId: string;
  structureType: BuildableStructureType;
  x: number;
  y: number;
};

export type UpdateStructureData = {
  x?: number;
  y?: number;
  upgradeLevel?: number;
};

export type ItemOnStructure = Pick<Item, "id" | "itemType">;

export type BugOnStructure = Pick<Bug, "id" | "bugType">;

export type StructureOnGridDto = Pick<
  Structure,
  "id" | "structureType" | "upgradeLevel" | "x" | "y"
> & {
  items: ItemOnStructure[];
  bugs: BugOnStructure[];
};

export type StructureDto = StructureOnGridDto & Pick<Structure, "authorId">;

export type StructureWithContents = Structure & { items: Item[]; bugs: Bug[] };
