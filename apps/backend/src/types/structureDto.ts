import { BuildableStructureType } from "@happy-little-bug-town/utils";

import { Bug, Item, Structure, Tool } from "../prisma/prisma/client.js";

export type CreateStructureData = {
  authorId: string;
  structureType: BuildableStructureType;
  x: number;
  y: number;
};

export type ItemOnStructure = Pick<Item, "id" | "itemType">;

export type BugOnStructure = Pick<Bug, "id" | "bugType">;

export type ToolOnStructure = Pick<Tool, "id" | "toolType">;

export type StructureOnGridDto = Pick<Structure, "id" | "structureType" | "x" | "y"> & {
  items: ItemOnStructure[];
  bugs: BugOnStructure[];
  tools: ToolOnStructure[];
};

export type StructureDto = StructureOnGridDto & Pick<Structure, "authorId">;

export type StructureWithItems = Structure & { items: Item[]; bugs: Bug[]; tools: Tool[] };
